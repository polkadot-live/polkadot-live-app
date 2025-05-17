// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '../config';
import { APIsController } from '../controllers/APIsController';
import { chainUnits } from '@polkadot-live/consts/chains';
import { unitToPlanck } from '@w3ux/utils';
import { concatU8a, hexToU8a } from 'dedot/utils';
import { ExtraSignedExtension } from 'dedot';
import {
  getAddressNonce,
  getNominationPoolRewards,
  getSpendableBalance,
} from '../library/AccountsLib';

import type { AnyData } from '@polkadot-live/types/misc';
import type { Extrinsic } from 'dedot/codecs';
import type {
  ActionMeta,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';
import type {
  ISubmittableExtrinsic,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from 'dedot/types';
import * as $ from '@dedot/shape';

type SubmittableExtrinsic = Extrinsic & ISubmittableExtrinsic;

const TOKEN_TRANSFER_LIMIT = '100';

interface CachedExtrinsicData {
  tx: SubmittableExtrinsic;
  extra?: ExtraSignedExtension;
  // Required for signing with WalletConnect.
  payload?: SignerPayloadJSON;
  rawPayload?: SignerPayloadRaw;
}

interface VerifyExtrinsicResult {
  isValid: boolean;
  reason?: string;
}

export class ExtrinsicsController {
  private static txPayloads = new Map<string, CachedExtrinsicData>();

  /**
   * Get a payload object (currently required by WalletConnect)
   */
  static getTransactionPayload = (txId: string) => this.txPayloads.get(txId);

  /**
   * Construct an extrinsic's arguments.
   */
  static getExtrinsicArgs = (actionMeta: ActionMeta): AnyData => {
    const { action, args } = actionMeta;

    let pargs: AnyData;
    if (action === 'balances_transferKeepAlive') {
      pargs = [args[0], BigInt(args[1])];
    } else {
      pargs = args;
    }

    return pargs;
  };

  /**
   * Independent method to get an estimated transaction fee.
   */
  static getEstimatedFee = async (info: ExtrinsicInfo): Promise<bigint> => {
    const { txId, actionMeta } = info;
    const { chainId, from, pallet, method } = info.actionMeta;

    const args = this.getExtrinsicArgs(actionMeta);
    const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();

    // Instantiate tx.
    console.log(`📝 New extrinsic: ${from}, ${pallet}, ${method}, ${args}`);
    const tx = api.tx[pallet][method](...args);
    this.txPayloads.set(txId, { tx });

    // Get estimated tx fee.
    const { partialFee } = await tx.paymentInfo(from);
    console.log(`📝 Estimated fee: ${partialFee.toString()}`);
    return partialFee;
  };

  /**
   * Instantiates a new tx based on the received extrinsic data.
   */
  static new = async (info: ExtrinsicInfo) => {
    try {
      const { txId } = info;
      const estimatedFee = await this.getEstimatedFee(info);

      ConfigRenderer.portToAction?.postMessage({
        task: 'action:tx:setEstimatedFee',
        data: { txId, estimatedFee: estimatedFee.toString() },
      });
    } catch (e) {
      console.log(e);
      this.handleTxError('An error occurred.');
    }
  };

  /**
   * Verify that an extrinsic is valid and can be submitted.
   * For example, check account balance is sufficient, etc.
   */
  static verifyExtrinsic = async (
    info: ExtrinsicInfo
  ): Promise<VerifyExtrinsicResult> => {
    // Check estimated fee exists.
    const { estimatedFee } = info;
    if (!estimatedFee) {
      return { isValid: false, reason: 'Estimated fee not set' };
    }

    const { action, chainId, from } = info.actionMeta;
    const args = this.getExtrinsicArgs(info.actionMeta);

    switch (action) {
      case 'balances_transferKeepAlive': {
        // NOTE: Disable Polkadot network transfers in alpha releases.
        if (chainId === 'Polkadot') {
          return {
            isValid: false,
            reason: 'Polkadot token transfers coming soon',
          };
        }

        const sendAmount: bigint = args[1];
        const spendable = await getSpendableBalance(from, chainId);
        const fee = BigInt(estimatedFee);

        // NOTE: Limit send amount to 100 tokens in alpha releases.
        const biLimit = unitToPlanck(TOKEN_TRANSFER_LIMIT, chainUnits(chainId));
        const checkA = sendAmount <= biLimit;
        const checkB = spendable >= sendAmount + fee;
        const isValid = checkA && checkB;

        return isValid
          ? { isValid }
          : !checkA
            ? { isValid, reason: 'Transfer limit of 100 tokens' }
            : { isValid, reason: 'Insufficient balance' };
      }
      case 'nominationPools_pendingRewards_withdraw':
      case 'nominationPools_pendingRewards_bond': {
        const spendable = await getSpendableBalance(from, chainId);
        const fee = BigInt(estimatedFee);

        // Check sufficient balance.
        if (spendable < fee) {
          return { isValid: false, reason: 'Insufficient balance' };
        }

        // Check rewards are current (extrinsic is not outdated).
        const { extra }: { extra: string } = info.actionMeta.data;
        const rewards = BigInt(extra);
        const curRewards = await getNominationPoolRewards(from, chainId);

        if (rewards !== curRewards) {
          return { isValid: false, reason: 'Outdated extrinsic' };
        }

        // Check rewards are non-zero.
        if (rewards === 0n) {
          return { isValid: false, reason: 'No pending rewards' };
        }

        return { isValid: true };
      }
    }
  };

  /**
   * Build and cache a transaction payload and send it back to action window.
   */
  static build = async (info: ExtrinsicInfo) => {
    try {
      const { txId, actionMeta } = info;
      const { chainId, from } = info.actionMeta;

      const api = (
        await APIsController.getConnectedApiOrThrow(chainId)
      ).getApi();

      // Create tx if it's not cached already.
      if (!this.txPayloads.has(txId)) {
        // Instantiate tx.
        const { pallet, method } = info.actionMeta;
        const args = this.getExtrinsicArgs(actionMeta);
        const tx = api.tx[pallet][method](...args);
        this.txPayloads.set(txId, { tx });
      }

      // Generate payload.
      const cached = this.txPayloads.get(txId);
      if (cached === undefined) {
        throw new Error('Error: Cached extrinsic data not found.');
      }

      // Build and cache payload.
      const { tx } = cached;
      // Optionally provide `PayloadOptions`.
      const extra = new ExtraSignedExtension(api, { signerAddress: from });
      await extra.init();

      const payload = extra.toPayload(tx.callHex);
      const rawPayload = extra.toRawPayload(tx.callHex);
      this.txPayloads.set(txId, { ...cached, rawPayload, extra, payload });

      // Verify extrinsic is valid for submission.
      const verifyResult = await this.verifyExtrinsic(info);
      console.log(`> Extrinsic is valid: ${JSON.stringify(verifyResult)}`);

      if (verifyResult.isValid) {
        const genesisHash = api.genesisHash;
        const nonce = await getAddressNonce(api, from);

        const prefix = $.compactU32.encode(tx.callLength);
        const prefixedRawPayload = concatU8a(prefix, hexToU8a(rawPayload.data));

        ConfigRenderer.portToAction?.postMessage({
          task: 'action:tx:report:data',
          data: {
            accountNonce: nonce,
            genesisHash,
            txId,
            txPayload: prefixedRawPayload,
          },
        });
      } else {
        this.handleTxError(verifyResult.reason || 'Reason unknown.');
      }
    } catch (err) {
      console.log(err);
      this.handleTxError('An error occurred.');
    }
  };

  /**
   * Delete a cached extrinsic.
   */
  static deleteTx = (txId: string) => {
    this.txPayloads.delete(txId);
  };

  /**
   * Utility for getting silence settings.
   */
  static silenceOsNotifications = async (): Promise<boolean> => {
    const appSettings = await window.myAPI.getAppSettings();
    return (
      appSettings.appSilenceOsNotifications ||
      appSettings.appSilenceExtrinsicsOsNotifications
    );
  };

  /**
   * Mock submitting a transaction.
   */
  static mockSubmit = (info: ExtrinsicInfo, interval = 3000) => {
    let mockStatus: TxStatus = 'submitted';
    this.postTxStatus(mockStatus, info);

    const intervalId = setInterval(async () => {
      switch (mockStatus) {
        case 'submitted': {
          mockStatus = 'in_block';
          this.postTxStatus('submitted', info, true);

          if (!(await this.silenceOsNotifications())) {
            window.myAPI.showNotification({
              title: 'Transaction Submitted',
              body: 'Transaction has been submitted and is processing.',
            });
          }

          break;
        }
        case 'in_block': {
          mockStatus = 'finalized';
          this.postTxStatus('in_block', info, true);

          if (!(await this.silenceOsNotifications())) {
            window.myAPI.showNotification({
              title: 'In Block',
              body: 'Transaction is in block.',
            });
          }
          break;
        }
        case 'finalized': {
          clearInterval(intervalId);
          this.postTxStatus(mockStatus, info, true);

          if (!(await this.silenceOsNotifications())) {
            window.myAPI.showNotification({
              title: 'Finalized',
              body: 'Transaction was finalised.',
            });
          }
          break;
        }
      }
    }, interval);
  };

  /**
   * Handles sending a signed transaction.
   */
  static submit = async (info: ExtrinsicInfo) => {
    const { txId } = info;
    const { from, chainId } = info.actionMeta;

    try {
      if (!(info.dynamicInfo && info.dynamicInfo.txSignature)) {
        throw new Error('Error: Extrinsic not built or signature missing.');
      }

      const api = (
        await APIsController.getConnectedApiOrThrow(chainId)
      ).getApi();

      // Get cached tx and extra signer.
      const { extra, tx } = this.txPayloads.get(txId)!;

      // Add signature to transaction.
      const { txSignature } = info.dynamicInfo;
      const { signatureTypeId } = api.registry.metadata!.extrinsic;
      const $Signature = api.registry.findCodec(signatureTypeId);

      tx.attachSignature({
        address: from,
        signature: $Signature.tryDecode(txSignature),
        extra: extra!.data,
      });

      const unsub = await tx.send(async ({ status }) => {
        switch (status.type) {
          case 'Broadcasting': {
            this.postTxStatus('submitted', info);

            if (!(await this.silenceOsNotifications())) {
              window.myAPI.showNotification({
                title: 'Transaction Submitted',
                body: 'Transaction has been submitted and is processing.',
              });
            }
            break;
          }
          case 'BestChainBlockIncluded': {
            this.postTxStatus('in_block', info);

            if (!(await this.silenceOsNotifications())) {
              window.myAPI.showNotification({
                title: 'In Block',
                body: 'Transaction is in block.',
              });
            }
            break;
          }
          case 'Finalized': {
            this.postTxStatus('finalized', info);

            if (!(await this.silenceOsNotifications())) {
              window.myAPI.showNotification({
                title: 'Finalized',
                body: 'Transaction was finalised.',
              });
            }

            unsub();
            break;
          }
        }
      });
    } catch (e) {
      window.myAPI.relaySharedState('isBuildingExtrinsic', false);
      console.log(e);
      this.postTxStatus('error', info);
    }
  };

  /**
   * Send tx status message to `action` window.
   */
  private static postTxStatus = (
    status: TxStatus,
    info: ExtrinsicInfo,
    isMock = false
  ) => {
    const {
      txId,
      actionMeta: { eventUid, chainId },
    } = info;

    // Report status in actions window.
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:tx:report:status',
      data: { status, txId },
    });

    if (eventUid) {
      // Mark event as stale if status is finalized.
      if (status === 'finalized' && !isMock) {
        window.myAPI.sendEventTask({
          action: 'events:makeStale',
          data: { uid: eventUid, chainId },
        });
      }
    }
  };

  /**
   * @name handleTxError
   * @summary Render toast error and stop building extrinsic in extrinsics renderer.
   */
  private static handleTxError = (message: string) => {
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:tx:invalid',
      data: { message },
    });
  };
}
