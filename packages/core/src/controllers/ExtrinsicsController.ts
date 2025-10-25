// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as $ from '@dedot/shape';
import { ConfigRenderer } from '../config';
import { APIsController } from '../controllers/APIsController';
import { ChainList, chainUnits } from '@polkadot-live/consts/chains';
import { unitToPlanck } from '@w3ux/utils';
import { concatU8a, hexToU8a, u8aToHex } from 'dedot/utils';
import { MerkleizedMetadata } from 'dedot/merkleized-metadata';
import { ExtrinsicError } from '../errors';
import { ExtraSignedExtension } from 'dedot';
import {
  getAddressNonce,
  getNominationPoolRewards,
  getSpendableBalanceElectron,
} from '../library/AccountsLib';

import type { AnyData } from '@polkadot-live/types/misc';
import type { HexString } from 'dedot/utils';
import type {
  ActionMeta,
  CachedExtrinsicData,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';
import type { SignerPayloadRaw } from 'dedot/types';

const TOKEN_TRANSFER_LIMIT = '100';

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
    } else if (action === 'nominationPools_pendingRewards_bond') {
      pargs = [{ type: 'Rewards' }];
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
    console.log(`📝 New extrinsic: ${chainId}, ${from}, ${pallet}, ${method}`);
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
        // NOTE: Disable Polkadot network transfers in pre-releases.
        if (chainId === 'Polkadot Relay') {
          return {
            isValid: false,
            reason: 'Polkadot token transfers coming soon',
          };
        }

        const sendAmount: bigint = args[1];
        const spendable = BigInt(
          await getSpendableBalanceElectron(from, chainId)
        );
        const fee = BigInt(estimatedFee);

        // NOTE: Limit send amount to 100 tokens in pre-releases.
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
        const spendable = BigInt(
          await getSpendableBalanceElectron(from, chainId)
        );
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
      const { chainId, from, source } = info.actionMeta;

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
        throw new ExtrinsicError('ExtrinsicNotFound');
      }

      // Build and cache payload.
      const { tx } = cached;
      let rawPayload: SignerPayloadRaw | null = null;

      if (source === 'ledger') {
        const { units, unit } = ChainList.get(chainId)!;
        const metadata = api.metadata;
        const merkleizer = new MerkleizedMetadata(metadata, {
          decimals: units,
          tokenSymbol: unit,
        });

        const extra = new ExtraSignedExtension(api, {
          signerAddress: from,
          payloadOptions: {
            metadataHash: u8aToHex(merkleizer.digest()),
          },
        });
        await extra.init();

        rawPayload = extra.toRawPayload(tx.callHex);
        const payload = extra.toPayload(tx.callHex);
        const proof = merkleizer.proofForExtrinsicPayload(
          rawPayload.data as HexString
        );

        this.txPayloads.set(txId, {
          ...cached,
          rawPayload,
          extra,
          payload,
          proof,
        });
      } else {
        const extra = new ExtraSignedExtension(api, { signerAddress: from });
        await extra.init();

        rawPayload = extra.toRawPayload(tx.callHex);
        const payload = extra.toPayload(tx.callHex);
        this.txPayloads.set(txId, { ...cached, rawPayload, extra, payload });
      }

      // Verify extrinsic is valid for submission.
      const verifyResult = await this.verifyExtrinsic(info);
      console.log(`> Extrinsic is valid: ${JSON.stringify(verifyResult)}`);

      if (!verifyResult.isValid) {
        this.handleTxError(verifyResult.reason || 'Reason unknown.');
      }

      const genesisHash = api.genesisHash;
      const nonce = await getAddressNonce(api, from);
      const prefix = $.compactU32.encode(tx.callLength);
      // Prefixed raw payload for Vault.
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
    const map = await window.myAPI.getAppSettings();
    return (
      Boolean(map.get('setting:silence-os-notifications')) ||
      Boolean(map.get('setting:silence-extrinsic-notifications'))
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
      if (!info.dynamicInfo) {
        throw new ExtrinsicError('DynamicInfoUndefined');
      } else if (!info.dynamicInfo.txSignature) {
        throw new ExtrinsicError('SignatureUndefined');
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

      const unsub = await tx.send(async ({ status, txHash }) => {
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
            info.txHash = txHash;
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
      window.myAPI.relaySharedState('extrinsic:building', false);
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
      txHash,
      actionMeta: { eventUid, chainId },
    } = info;

    // Report status in actions window.
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:tx:report:status',
      data: txHash ? { status, txId, txHash } : { status, txId },
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
