// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  extrinsics: new Map(),
  getGenesisHash: () => null,
  getTxPayload: () => null,
  initTx: () => {},
  initTxDynamicInfo: () => {},
  setTxDynamicInfo: () => {},
  setTxSignature: () => {},
  submitTx: () => {},
  updateTxStatus: () => {},
  removeExtrinsic: () => {},

  //notEnoughFunds: false,
  //resetTxFees: () => {},
  //txFeesValid: false,
};
