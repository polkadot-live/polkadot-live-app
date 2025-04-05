// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@ren/controller/APIsController';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { chainUnits } from '@ren/config/chains';
import { unitToPlanck } from '@w3ux/utils';
import {
  getAddressNonce,
  getNominationPoolRewards,
  getSpendableBalance,
} from '@ren/utils/AccountUtils';

import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { ApiPromise } from '@polkadot/api';
import type {
  ActionMeta,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';

const TOKEN_TRANSFER_LIMIT = '100';

interface CachedExtrinsicData {
  tx: AnyData;
  raw?: AnyData;
  payload?: AnyData;
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
    const { api } = await APIsController.getConnectedApiOrThrow(chainId);
    console.log(`📝 New extrinsic: ${from}, ${pallet}, ${method}, ${args}`);

    // Instantiate tx.
    const tx = api.tx[pallet][method](...args);
    this.txPayloads.set(txId, { tx });

    // Get estimated tx fee.
    const { partialFee } = await tx.paymentInfo(from);
    const estimatedFeePlank = BigInt(partialFee.toString());
    console.log(`📝 Estimated fee: ${estimatedFeePlank.toString()}`);

    return estimatedFeePlank;
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
      const { api } = await APIsController.getConnectedApiOrThrow(chainId);
      const nonce = Number(await getAddressNonce(from, chainId));

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
      const { rawPayload, payload } = await this.buildPayload(
        tx,
        from,
        nonce,
        api
      );

      this.txPayloads.set(txId, { ...cached, raw: rawPayload, payload });

      // Verify extrinsic is valid for submission.
      const verifyResult = await this.verifyExtrinsic(info);
      console.log(`> Extrinsic is valid: ${JSON.stringify(verifyResult)}`);

      if (verifyResult.isValid) {
        ConfigRenderer.portToAction?.postMessage({
          task: 'action:tx:report:data',
          data: {
            accountNonce: nonce,
            genesisHash: rawPayload.genesisHash.toU8a(),
            txId,
            txPayload: rawPayload.toU8a(),
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
   * Build a transaction payload.
   */
  static buildPayload = async (
    tx: AnyJson,
    from: string,
    accountNonce: number,
    api: ApiPromise
  ) => {
    const lastHeader = await api.rpc.chain.getHeader();
    const blockNumber = api.registry.createType(
      'BlockNumber',
      lastHeader.number.toNumber()
    );

    const method = api.createType('Call', tx);
    const era = api.registry.createType('ExtrinsicEra', {
      current: lastHeader.number.toNumber(),
      period: 64,
    });

    const nonce = api.registry.createType('Compact<Index>', accountNonce);

    const payload = {
      specVersion: api.runtimeVersion.specVersion.toHex(),
      transactionVersion: api.runtimeVersion.transactionVersion.toHex(),
      address: from,
      blockHash: lastHeader.hash.toHex(),
      blockNumber: blockNumber.toHex(),
      era: era.toHex(),
      genesisHash: api.genesisHash.toHex(),
      method: method.toHex(),
      nonce: nonce.toHex(),
      signedExtensions: [
        'CheckNonZeroSender',
        'CheckSpecVersion',
        'CheckTxVersion',
        'CheckGenesis',
        'CheckMortality',
        'CheckNonce',
        'CheckWeight',
        'ChargeTransactionPayment',
      ],
      tip: api.registry.createType('Compact<Balance>', 0).toHex(),
      version: tx.version,
    };

    const rawPayload = api.registry.createType('ExtrinsicPayload', payload, {
      version: payload.version,
    });

    return { rawPayload, payload };
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
    const { from } = info.actionMeta;

    try {
      if (!(info.dynamicInfo && info.dynamicInfo.txSignature)) {
        throw new Error('Error: Extrinsic not built or signature missing.');
      }

      // Get cached tx and payload.
      const { raw: txPayload, tx } = this.txPayloads.get(txId)!;

      // Add signature to transaction.
      const { txSignature } = info.dynamicInfo;
      tx.addSignature(from, txSignature, txPayload.toU8a());

      const unsub = await tx.send(async ({ status }: AnyJson) => {
        if (status.isInBlock) {
          this.postTxStatus('in_block', info);

          if (!(await this.silenceOsNotifications())) {
            window.myAPI.showNotification({
              title: 'In Block',
              body: 'Transaction is in block.',
            });
          }
        } else if (status.isFinalized) {
          this.postTxStatus('finalized', info);

          if (!(await this.silenceOsNotifications())) {
            window.myAPI.showNotification({
              title: 'Finalized',
              body: 'Transaction was finalised.',
            });
          }

          unsub();
        }
      });

      this.postTxStatus('submitted', info);

      if (!(await this.silenceOsNotifications())) {
        window.myAPI.showNotification({
          title: 'Transaction Submitted',
          body: 'Transaction has been submitted and is processing.',
        });
      }
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
