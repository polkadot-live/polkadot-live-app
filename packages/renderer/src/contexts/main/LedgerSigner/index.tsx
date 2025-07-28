// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext } from 'react';
import { ConfigRenderer, ExtrinsicsController } from '@polkadot-live/core';
import { ledgerErrorMeta } from '@polkadot-live/consts/ledger';
import { decodeAddress, u8aToHex } from 'dedot/utils';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { HexString } from 'dedot/utils';
import type { LedgerErrorStatusCode } from '@polkadot-live/types/ledger';
import type { LedgerSignerContextInterface } from './types';

class LedgerTxError extends Error {
  statusCode: LedgerErrorStatusCode;

  constructor(statusCode: LedgerErrorStatusCode, message = 'LedgerTxError') {
    super(message);
    this.name = 'LedgerTxError';
    this.statusCode = statusCode;
  }
}

export const LedgerSignerContext = createContext<LedgerSignerContextInterface>(
  defaults.defaultLedgerSignerContext
);

export const useLedgerSigner = () => useContext(LedgerSignerContext);

export const LedgerSignerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * Sends Ledger error data to extrinsics window.
   */
  const postError = (statusCode: LedgerErrorStatusCode) => {
    const errorData = ledgerErrorMeta[statusCode];
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:ledger:error',
      data: JSON.stringify(errorData),
    });
  };

  /**
   * Signs a transaction with a connected Ledger device and submits it to the network.
   */
  const ledgerSignSubmit = async (info: ExtrinsicInfo) => {
    try {
      await fetchLedgerMetadata(info);
      if (!info.actionMeta.ledgerMeta) {
        throw new LedgerTxError('TxLedgerMetaUndefined');
      }

      const { chainId } = info.actionMeta;
      const { accountIndex: index } = info.actionMeta.ledgerMeta;
      const { txId, dynamicInfo } = info;

      if (!dynamicInfo) {
        throw new LedgerTxError('TxDynamicInfoUndefined');
      }

      const txData = ExtrinsicsController.getTransactionPayload(txId);
      if (!txData) {
        throw new LedgerTxError('TxDataUndefined');
      }

      const { proof, rawPayload } = txData;
      if (!(proof && rawPayload)) {
        throw new LedgerTxError('TxPayloadsUndefined');
      }

      // Send data to main process for signing.
      const proofHex = u8aToHex(proof);
      const rawPayloadHex = rawPayload.data as HexString;
      const result = await window.myAPI.doLedgerTask(
        'ledger_sign',
        JSON.stringify({ index, chainId, proofHex, rawPayloadHex })
      );

      if (result.ack === 'failure') {
        throw new LedgerTxError(result.statusCode as LedgerErrorStatusCode);
      }

      const { signature }: { signature: HexString } = JSON.parse(
        result.serData!
      );

      // Attach signature to `info` and submit transaction.
      dynamicInfo.txSignature = signature;
      ExtrinsicsController.submit(info);

      // Close overlay in extrinsics window.
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:overlay:close',
        data: null,
      });
    } catch (error) {
      window.myAPI.relaySharedState('extrinsic:building', false);
      error instanceof LedgerTxError
        ? postError(error.statusCode)
        : console.error(error);
    }
  };

  /**
   * Fetch signing account's Ledger metadata from store if it's currently undefined in info.
   */
  const fetchLedgerMetadata = async (info: ExtrinsicInfo) => {
    try {
      if (info.actionMeta.ledgerMeta) {
        return;
      }

      const result = (await window.myAPI.rawAccountTask({
        action: 'raw-account:get:ledger-meta',
        data: {
          serialized: JSON.stringify({
            chainId: info.actionMeta.chainId,
            publicKeyHex: u8aToHex(decodeAddress(info.actionMeta.from)),
          }),
        },
      })) as string;

      result !== '' && (info.actionMeta.ledgerMeta = JSON.parse(result));
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  return (
    <LedgerSignerContext.Provider value={{ ledgerSignSubmit }}>
      {children}
    </LedgerSignerContext.Provider>
  );
};
