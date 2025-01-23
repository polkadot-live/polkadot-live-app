// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  addressesInfo: [],
  extrinsics: new Map(),
  selectedFilter: 'all',
  getFilteredExtrinsics: () => [],
  getGenesisHash: () => null,
  getTxPayload: () => null,
  initTx: () => {},
  initTxDynamicInfo: () => {},
  onFilterChange: () => {},
  setTxDynamicInfo: () => {},
  setTxSignature: () => {},
  submitTx: () => {},
  updateTxStatus: () => {},
  removeExtrinsic: () => {},

  //notEnoughFunds: false,
  //resetTxFees: () => {},
  //txFeesValid: false,
};
