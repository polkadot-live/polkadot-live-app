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

// TODO: Create an Extrinsic model and instantiate when constructing a transaction.
export class ExtrinsicsController {
  // TODO: Remove static properties.
  static chainId: ChainID | null = null;
  static tx: AnyJson | null = null;
  static txId = 0;
  static estimatedFee: BigNumber = new BigNumber(0);
  static payload: AnyJson | null = null;
  static signature: AnyJson | null = null;
  static from: string | null = null;
  static eventUid: string | null = null;

  // instantiates a new tx based on the request received by renderer.
  static new = async (info: ExtrinsicInfo) => {
    try {
      const {
        txId,
        actionMeta: { chainId, from, pallet, method, args, eventUid },
      } = info;

      // TODO: Get nonce later.
      //const accountNonce = !nonce ? 0 : new BigNumber(nonce).toNumber();
      const accountNonce = (await getAddressNonce(from, chainId)).toNumber();

      const origin = 'ExtrinsicsController.new';
      const { api } = await getApiInstanceOrThrow(chainId, origin);
      console.log(`📝 New extrinsic: ${from}, ${pallet}, ${method}, ${args}`);

      // Instantiate tx.
      const tx = api.tx[pallet][method](...args);
      this.chainId = chainId;
      this.tx = tx;
      this.from = from;
      this.txId = this.txId + 1;

      // Set associated event uid.
      this.eventUid = eventUid;

      // Get estimated tx fee.
      const { partialFee } = await tx.paymentInfo(from);
      const estimatedFeePlank = new BigNumber(partialFee.toString());
      this.estimatedFee = estimatedFeePlank;

      const estimatedFee = planckToUnit(estimatedFeePlank, chainUnits(chainId));
      console.log(`📝 Estimated fee: ${estimatedFee}`);

      // Generate payload and store.
      await this.buildPayload(chainId, from, accountNonce);

      // Report Tx to Action UI.
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:tx:report:data',
        data: {
          txId,
          txPayload: this.payload.toU8a(),
          accountNonce,
          estimatedFee: estimatedFee.toString(),
          genesisHash: this.payload.genesisHash,
        },
      });
    } catch (e) {
      console.log('Error:');
      console.log(e);
      // Send error to action window?
    }
  };

  // Build payload.
  static buildPayload = async (
    chainId: ChainID,
    from: string,
    accountNonce: number
  ) => {
    // build and set payload of the transaction and store it in TxMetaContext.
    const origin = 'ExtrinsicsController.buildPayload';
    const { api } = await getApiInstanceOrThrow(chainId, origin);

    const lastHeader = await api.rpc.chain.getHeader();
    const blockNumber = api.registry.createType(
      'BlockNumber',
      lastHeader.number.toNumber()
    );
    const method = api.createType('Call', this.tx);
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
      signedExtensions: api.registry.signedExtensions,
      tip: api.registry.createType('Compact<Balance>', 0).toHex(),
      version: this.tx.version,
    };
    const raw = api.registry.createType('ExtrinsicPayload', payload, {
      version: payload.version,
    });
    this.setTxPayload(raw);
  };

  // Sets the payload.
  static setTxPayload = (payload: AnyJson) => {
    this.payload = payload;
  };

  // Sets the tx signature.
  static setSignature = (signature: AnyJson) => {
    this.signature = signature;
  };

  // Resets the class members.
  static reset() {
    this.chainId = null;
    this.tx = null;
    this.txId = 0;
    this.from = null;
    this.estimatedFee = new BigNumber(0);
    this.payload = null;
    this.signature = null;
  }

  // handle signed transaction.
  static submit = async () => {
    // Cache correct event UID in function for lambdas.
    const uid = this.eventUid || '';
    const chainId = this.chainId || 'Polkadot';

    if (this.signature) {
      try {
        this.tx.addSignature(this.from, this.signature, this.payload);

        const unsub = await this.tx.send(({ status }: AnyJson) => {
          if (status.isInBlock) {
            // Report Tx Status to Action UI.
            ExtrinsicsController.postTxStatus('in_block', uid, chainId);

            // Show native OS notification.
            window.myAPI.showNotification({
              title: 'In Block',
              body: 'Transaction is in block.',
            });
          } else if (status.isFinalized) {
            // Report Tx Status to Action UI.
            ExtrinsicsController.postTxStatus('finalized', uid, chainId);

            // Show native OS notification.
            window.myAPI.showNotification({
              title: 'Finalized',
              body: 'Transaction was finalised.',
            });

            unsub();
          }
        });

        // Report Tx Status to Action UI.
        ExtrinsicsController.postTxStatus('submitted', uid, chainId);

        // Show native OS notification.
        window.myAPI.showNotification({
          title: 'Transaction Submitted',
          body: 'Transaction has been submitted and is processing.',
        });

        this.reset();
      } catch (e) {
        ExtrinsicsController.postTxStatus('error', uid, chainId);

        console.log(e);
        // Handle error.
      }
    }
  };

  // Send tx status message to `action` window.
  private static postTxStatus = (
    status: TxStatus,
    uid: string,
    chainId: ChainID
  ) => {
    // Report status in actions window.
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:tx:report:status',
      data: {
        status,
      },
    });

    // Mark event as stale if status is finalized.
    if (status === 'finalized') {
      window.myAPI.sendEventTask({
        action: 'events:makeStale',
        data: { uid, chainId },
      });
    }
  };
}
