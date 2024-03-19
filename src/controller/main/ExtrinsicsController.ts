// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils';
import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import { Config as ConfigMain } from '@/config/processes/main';
import { getApiInstance } from '@/utils/ApiUtils';
import type { AnyJson } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { TxStatus } from '@/types/tx';

// TODO: Create an Extrinsic model and instantiate when constructing a transaction.
export class ExtrinsicsController {
  static chainId: ChainID | null = null;

  static tx: AnyJson | null = null;

  static txId = 0;

  static estimatedFee: BigNumber = new BigNumber(0);

  static payload: AnyJson | null = null;

  static signature: AnyJson | null = null;

  static from: string | null = null;

  // instantiates a new tx based on the request received by renderer.
  static new = async (
    chainId: ChainID,
    from: string,
    accountNonce: number,
    pallet: string,
    method: string,
    args: AnyJson[]
  ) => {
    try {
      const { api } = await getApiInstance(chainId);

      console.log(`📝 New extrinsic: ${from}, ${pallet}, ${method}, ${args}`);

      // Instantiate tx.
      const tx = api.tx[pallet][method](...args);
      this.chainId = chainId;
      this.tx = tx;
      this.from = from;
      this.txId = this.txId + 1;

      // Get estimated tx fee.
      const { partialFee } = await tx.paymentInfo(from);
      const estimatedFeePlank = new BigNumber(partialFee.toString());
      this.estimatedFee = estimatedFeePlank;

      // Send tx data to action UI.
      const estimatedFee = planckToUnit(estimatedFeePlank, chainUnits(chainId));
      console.log(`📝 Estimated fee: ${estimatedFee}`);

      // Generate payload and store.
      await this.buildPayload(chainId, from, accountNonce);

      // Report Tx to Action UI.
      ConfigMain.portToAction.postMessage({
        task: 'action:tx:report:data',
        data: {
          estimatedFee: estimatedFee.toString(),
          txId: this.txId,
          payload: this.payload.toU8a(),
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
    const { api } = await getApiInstance(chainId);

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
    if (this.signature) {
      try {
        this.tx.addSignature(this.from, this.signature, this.payload);

        const unsub = await this.tx.send(({ status }: AnyJson) => {
          if (status.isInBlock) {
            // Report Tx Status to Action UI.
            ExtrinsicsController.postTxStatus('in_block');

            // Show native OS notification.
            window.myAPI.showNotification({
              title: 'In Block',
              body: 'Transaction is in block.',
            });
          } else if (status.isFinalized) {
            // Report Tx Status to Action UI.
            ExtrinsicsController.postTxStatus('finalized');

            // Show native OS notification.
            window.myAPI.showNotification({
              title: 'Finalized',
              body: 'Transaction was finalised.',
            });

            unsub();
          }
        });

        // Report Tx Status to Action UI.
        ExtrinsicsController.postTxStatus('submitted');

        // Show native OS notification.
        window.myAPI.showNotification({
          title: 'Transaction Submitted',
          body: 'Transaction has been submitted and is processing.',
        });

        this.reset();
      } catch (e) {
        ExtrinsicsController.postTxStatus('error');

        console.log(e);
        // Handle error.
      }
    }
  };

  // Send tx status message to `action` window.
  private static postTxStatus = (status: TxStatus) => {
    ConfigMain.portToAction.postMessage({
      task: 'action:tx:report:status',
      data: {
        status,
      },
    });
  };
}
