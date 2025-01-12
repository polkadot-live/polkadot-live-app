// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import BigNumber from 'bignumber.js';
import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  initTx: () => {},
  initTxDynamicInfo: () => {},
  setTxDynamicInfo: () => {},
  getTxPayload: () => {},
  getGenesisHash: () => null,
  setTxSignature: () => {},
  submitTx: () => {},
  extrinsics: new Map(),

  //getTxSignature: () => null,

  txFees: new BigNumber(0),
  notEnoughFunds: false,
  setTxFees: (f) => {},
  resetTxFees: () => {},
  sender: null,
  setSender: (s) => {},
  txFeesValid: false,
  setTxPayload: (p, u) => {},
  resetTxPayloads: () => {},
  actionMeta: null,
  setActionMeta: () => {},
  txId: 0,
  estimatedFee: '...',
  setEstimatedFee: (n) => {},
  setTxId: () => {},
  txStatus: 'pending',
  setTxStatus: (s) => {},
};
