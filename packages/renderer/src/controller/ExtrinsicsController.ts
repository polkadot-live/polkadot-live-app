// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainUnits } from '@ren/config/chains';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { getAddressNonce } from '@ren/utils/AccountUtils';
import { getApiInstanceOrThrow } from '@ren/utils/ApiUtils';
import { planckToUnit } from '@w3ux/utils';
import type { AnyJson } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';

interface CachedExtrinsicData {
  tx: AnyJson;
  payload?: AnyJson;
}

export class ExtrinsicsController {
  private static txPayloads = new Map<string, CachedExtrinsicData>();

  /**
   * Instantiates a new tx based on the received extrinsic data.
   */
  static new = async (info: ExtrinsicInfo) => {
    try {
      const { txId } = info;
      const { chainId, from, pallet, method, args } = info.actionMeta;

      const origin = 'ExtrinsicsController.new';
      const { api } = await getApiInstanceOrThrow(chainId, origin);
      console.log(`📝 New extrinsic: ${from}, ${pallet}, ${method}, ${args}`);

      // Instantiate tx.
      const tx = api.tx[pallet][method](...args);
      this.txPayloads.set(txId, { tx });

      // Get estimated tx fee.
      const { partialFee } = await tx.paymentInfo(from);
      const estimatedFeePlank = new BigNumber(partialFee.toString());
      const estimatedFee = planckToUnit(estimatedFeePlank, chainUnits(chainId));
      console.log(`📝 Estimated fee: ${estimatedFee}`);

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
   * Build and cache a transaction payload and send it back to action window.
   */
  static build = async (info: ExtrinsicInfo) => {
    try {
      const { txId } = info;
      const { chainId, from } = info.actionMeta;
      const nonce = (await getAddressNonce(from, chainId)).toNumber();

      // Generate payload.
      const cached = this.txPayloads.get(txId);
      if (cached === undefined) {
        throw new Error('Error: Cached extrinsic data not found.');
      }

      // Build and cache payload.
      const { tx } = cached;
      const txPayload = await this.buildPayload(tx, chainId, from, nonce);
      this.txPayloads.set(txId, { tx, payload: txPayload });

      ConfigRenderer.portToAction?.postMessage({
        task: 'action:tx:report:data',
        data: {
          accountNonce: nonce,
          genesisHash: txPayload.genesisHash.toU8a(),
          txId,
          txPayload: txPayload.toU8a(),
        },
      });
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
   * Mock submitting a transaction.
   */
  static mockSubmit = (info: ExtrinsicInfo, interval = 3000) => {
    let mockStatus: TxStatus = 'submitted';
    this.postTxStatus(mockStatus, info);

    const intervalId = setInterval(() => {
      switch (mockStatus) {
        case 'submitted': {
          mockStatus = 'in_block';
          this.postTxStatus('submitted', info, true);
          break;
        }
        case 'in_block': {
          mockStatus = 'finalized';
          this.postTxStatus('in_block', info, true);
          break;
        }
        case 'finalized': {
          clearInterval(intervalId);
          this.postTxStatus(mockStatus, info, true);
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
    const { from, method, pallet, args, chainId } = info.actionMeta;

    try {
      if (!info.dynamicInfo) {
        throw new Error('Error: Extrinsic not built.');
      }
      if (!info.dynamicInfo.txSignature) {
        throw new Error('Error: Extrinsic signature not found.');
      }

      // Build transaction.
      const origin = 'ExtrinsicsController.submit';
      const { api } = await getApiInstanceOrThrow(chainId, origin);
      const tx = api.tx[pallet][method](...args);

      // Get cached payload.
      const { payload: txPayload } = this.txPayloads.get(txId)!;

      // Add signature to transaction.
      const { txSignature } = info.dynamicInfo;
      tx.addSignature(from, txSignature, txPayload.toU8a());

      const unsub = await tx.send(({ status }: AnyJson) => {
        if (status.isInBlock) {
          this.postTxStatus('in_block', info);

          window.myAPI.showNotification({
            title: 'In Block',
            body: 'Transaction is in block.',
          });
        } else if (status.isFinalized) {
          this.postTxStatus('finalized', info);

          window.myAPI.showNotification({
            title: 'Finalized',
            body: 'Transaction was finalised.',
          });

          unsub();
        }
      });

      this.postTxStatus('submitted', info);

      window.myAPI.showNotification({
        title: 'Transaction Submitted',
        body: 'Transaction has been submitted and is processing.',
      });
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

    // Mark event as stale if status is finalized.
    if (status === 'finalized' && !isMock) {
      window.myAPI.sendEventTask({
        action: 'events:makeStale',
        data: { uid: eventUid, chainId },
      });
    }
  };
}
