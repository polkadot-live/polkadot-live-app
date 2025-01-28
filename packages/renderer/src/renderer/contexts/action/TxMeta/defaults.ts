// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  addressesInfo: [],
  extrinsics: new Map(),
  selectedFilter: 'all',
  showMockUI: false,
  getCategoryTitle: () => '',
  getFilteredExtrinsics: () => [],
  getGenesisHash: () => null,
  getTxPayload: () => null,
  initTx: () => {},
  initTxDynamicInfo: () => {},
  onFilterChange: () => {},
  setEstimatedFee: () => new Promise(() => {}),
  setTxDynamicInfo: () => {},
  setTxSignature: () => {},
  submitTx: () => {},
  submitMockTx: () => {},
  updateAccountName: () => {},
  updateTxStatus: () => {},
  removeExtrinsic: () => new Promise(() => {}),

  //notEnoughFunds: false,
  //resetTxFees: () => {},
  //txFeesValid: false,
};
