// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils';
import BigNumber from 'bignumber.js';
import { NotificationsController } from './NotificationsController';
import { chainUnits } from '@/config/chains';
import { MainDebug } from '@/utils/DebugUtils';
import { WindowsController } from './WindowsController';
import { getApiInstance } from '@/utils/ApiUtils';
import type { ChainID } from '@/types/chains';
import type { AnyJson } from '@/types/misc';

const debug = MainDebug.extend('Extrinsic');

// TODO: Create an Extrinsic model and instantiate when constructing a transaction.
export class ExtrinsicsController {
  static chain: ChainID | null = null;

  static tx: AnyJson | null = null;

  static txId = 0;

  static estimatedFee: BigNumber = new BigNumber(0);

  static payload: AnyJson | null = null;

  static signature: AnyJson | null = null;

  static from: string | null = null;

  // instantiates a new tx based on the request received by renderer.
  static new = async (
    chain: ChainID,
    from: string,
    accountNonce: number,
    pallet: string,
    method: string,
    args: AnyJson[]
  ) => {
    try {
      const { api } = await getApiInstance(chain);

      debug('📝 New extrinsic: %o, %o, %o, %o', from, pallet, method, args);

      // Instantiate tx.
      const tx = api.tx[pallet][method](...args);
      this.chain = chain;
      this.tx = tx;
      this.from = from;
      this.txId = this.txId + 1;

      // Get estimated tx fee.
      const { partialFee } = await tx.paymentInfo(from);
      const estimatedFeePlank = new BigNumber(partialFee.toString());
      this.estimatedFee = estimatedFeePlank;

      // Send tx data to action UI.
      const estimatedFee = planckToUnit(estimatedFeePlank, chainUnits(chain));
      debug('📝 Estimated fee:: %o', estimatedFee);

      // Generate payload and store.
      await this.buildPayload(chain, from, accountNonce);

      // Report Tx to Action UI.
      WindowsController.get('action')?.webContents?.send(
        'renderer:tx:report:data',
        {
          estimatedFee: estimatedFee.toString(),
          txId: this.txId,
          payload: this.payload.toU8a(),
          genesisHash: this.payload.genesisHash,
        }
      );
    } catch (e) {
      debug('📝 Error: %o', e);
      // Send error to action window?
    }
  };

  // Build payload.
  static buildPayload = async (
    chain: ChainID,
    from: string,
    accountNonce: number
  ) => {
    // build and set payload of the transaction and store it in TxMetaContext.
    const { api } = await getApiInstance(chain);

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
    this.chain = null;
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
            // In block, send notification.
            NotificationsController.transactionStatus('in-block');

            // Report Tx Status to Action UI.
            WindowsController.get('action')?.webContents?.send(
              'renderer:tx:report:status',
              'in_block'
            );
          } else if (status.isFinalized) {
            // Finalized - send notification and unsub.
            NotificationsController.transactionStatus('finalized');

            // Report Tx Status to Action UI.
            WindowsController.get('action')?.webContents?.send(
              'renderer:tx:report:status',
              'finalized'
            );
            unsub();
          }
        });

        NotificationsController.transactionSubmitted();

        // Report Tx Status to Action UI.
        WindowsController.get('action')?.webContents?.send(
          'renderer:tx:report:status',
          'submitted'
        );
        this.reset();
      } catch (e) {
        WindowsController.get('action')?.webContents?.send(
          'renderer:tx:report:status',
          'error'
        );
        console.log(e);
        // Handle error.
      }
    }
  };
}
