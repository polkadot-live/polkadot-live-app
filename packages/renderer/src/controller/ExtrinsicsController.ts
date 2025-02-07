// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { getAddressNonce, getSpendableBalance } from '@ren/utils/AccountUtils';
import { getApiInstanceOrThrow } from '@ren/utils/ApiUtils';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ActionMeta,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';

interface CachedExtrinsicData {
  tx: AnyJson;
  payload?: AnyJson;
}
interface VerifyExtrinsicResult {
  isValid: boolean;
  reason?: string;
}

export class ExtrinsicsController {
  private static txPayloads = new Map<string, CachedExtrinsicData>();

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
  static getEstimatedFee = async (info: ExtrinsicInfo): Promise<BigNumber> => {
    const { txId, actionMeta } = info;
    const { chainId, from, pallet, method } = info.actionMeta;

    const args = this.getExtrinsicArgs(actionMeta);
    const origin = 'ExtrinsicsController.getEstimatedFee';
    const { api } = await getApiInstanceOrThrow(chainId, origin);
    console.log(`📝 New extrinsic: ${from}, ${pallet}, ${method}, ${args}`);

    // Instantiate tx.
    const tx = api.tx[pallet][method](...args);
    this.txPayloads.set(txId, { tx });

    // Get estimated tx fee.
    const { partialFee } = await tx.paymentInfo(from);
    const estimatedFeePlank = new BigNumber(partialFee.toString());
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
      // TODO: Send error to action window?
      console.log('Error:');
      console.log(e);
    }
  };

  /**
   * Verify that an extrinsic is valid and can be submitted.
   * For example, check account balance is sufficient, etc.
   */
  static verifyExtrinsic = async (
    info: ExtrinsicInfo
  ): Promise<VerifyExtrinsicResult> => {
    const { action, chainId, from } = info.actionMeta;
    const args = this.getExtrinsicArgs(info.actionMeta);

    switch (action) {
      case 'balances_transferKeepAlive': {
        // Check spendable balance is sufficient.
        const { estimatedFee } = info;
        if (!estimatedFee) {
          return { isValid: false, reason: 'Estimated fee not set' };
        }

        // args[1]: BigInt to string to BigNumber.
        const bnSendAmount = new BigNumber(args[1].toString());
        const bnSpendable = await getSpendableBalance(from, chainId);
        const bnFee = new BigNumber(estimatedFee);
        const isValid = bnSpendable.gte(bnSendAmount.plus(bnFee));

        return isValid
          ? { isValid }
          : { isValid, reason: 'Insufficient balance' };
      }
      case 'nominationPools_pendingRewards_bond': {
        // TODO: Check bond can be submitted.
        return { isValid: true };
      }
      case 'nominationPools_pendingRewards_withdraw': {
        // TODO: Check withdraw can be submitted.
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
      const nonce = (await getAddressNonce(from, chainId)).toNumber();

      // Create tx if it's not cached already.
      if (!this.txPayloads.has(txId)) {
        const origin = 'ExtrinsicsController.build';
        const { api } = await getApiInstanceOrThrow(chainId, origin);

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
      const txPayload = await this.buildPayload(tx, chainId, from, nonce);
      this.txPayloads.set(txId, { tx, payload: txPayload });

      // Verify extrinsic is valid for submission.
      const verifyResult = await this.verifyExtrinsic(info);
      console.log(`> Extrinsic is valid: ${JSON.stringify(verifyResult)}`);

      if (verifyResult.isValid) {
        ConfigRenderer.portToAction?.postMessage({
          task: 'action:tx:report:data',
          data: {
            accountNonce: nonce,
            genesisHash: txPayload.genesisHash.toU8a(),
            txId,
            txPayload: txPayload.toU8a(),
          },
        });
      } else {
        ConfigRenderer.portToAction?.postMessage({
          task: 'action:tx:invalid',
          data: { message: verifyResult.reason || 'Reason unknown.' },
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Build a transaction payload.
   */
  static buildPayload = async (
    tx: AnyJson,
    chainId: ChainID,
    from: string,
    accountNonce: number
  ) => {
    // Build and set payload of the transaction and store it in TxMetaContext.
    const origin = 'ExtrinsicsController.buildPayload';
    const { api } = await getApiInstanceOrThrow(chainId, origin);

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

    const raw = api.registry.createType('ExtrinsicPayload', payload, {
      version: payload.version,
    });

    return raw;
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
      const { payload: txPayload, tx } = this.txPayloads.get(txId)!;

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
      window.myAPI.relayModeFlag('isBuildingExtrinsic', false);
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
}
