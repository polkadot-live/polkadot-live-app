// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ExtrinsicsController,
  handleLedgerTaskError,
  LedgerTxError,
} from '@polkadot-live/core';
import { hexToU8a } from 'dedot/utils';
import { DbController, LedgerController } from '../../controllers';
import { getAccountLedgerMeta } from '../accounts';
import type { LedgerTaskResponse } from '@polkadot-live/types/ledger';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { HexString } from 'dedot/utils';

export const handleGetEstimatedFee = async (
  info: ExtrinsicInfo,
): Promise<string> =>
  (await ExtrinsicsController.getEstimatedFee(info)).toString();

export const handleBuildExtrinsic = async (info: ExtrinsicInfo) => {
  const result = await ExtrinsicsController.build(info);
  if (result) {
    const { accountNonce, genesisHash, txPayload } = result;
    return { accountNonce, genesisHash, txPayload };
  } else {
    return null;
  }
};

export const handleSubmitExtrinsic = async (info: ExtrinsicInfo) => {
  const results = (await Promise.all([
    DbController.get('settings', 'setting:silence-os-notifications'),
    DbController.get('settings', 'setting:silence-extrinsic-notifications'),
  ])) as boolean[];
  ExtrinsicsController.submit(info, results.some(Boolean));
};

export const handleSubmitMockExtrinsic = async (info: ExtrinsicInfo) => {
  const results = (await Promise.all([
    DbController.get('settings', 'setting:silence-os-notifications'),
    DbController.get('settings', 'setting:silence-extrinsic-notifications'),
  ])) as boolean[];
  ExtrinsicsController.mockSubmit(info, results.some(Boolean));
};

export const handleLedgerSignSubmit = async (
  info: ExtrinsicInfo,
): Promise<LedgerTaskResponse> => {
  try {
    const { chainId, from } = info.actionMeta;
    const meta = await getAccountLedgerMeta(chainId, from);
    if (!meta) {
      throw new Error('AccountLedgerMetaNotFound');
    }
    info.actionMeta.ledgerMeta = meta;
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
    const { app } = await LedgerController.initialize();
    const { accountIndex: index } = meta;
    const txBlob = hexToU8a(rawPayload.data);
    const res = await LedgerController.signPayload(app, index, txBlob, proof);

    if (!res.success) {
      return handleLedgerTaskError(res.error!);
    }
    dynamicInfo.txSignature = res.results! as HexString;

    const settings = (await Promise.all([
      DbController.get('settings', 'setting:silence-os-notifications'),
      DbController.get('settings', 'setting:silence-extrinsic-notifications'),
    ])) as boolean[];
    ExtrinsicsController.submit(info, settings.some(Boolean));

    return { ack: 'success', statusCode: 'LedgerSign' };
  } catch (error) {
    return handleLedgerTaskError(error as Error);
  }
};
