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
  handleOpenCloseWcModal: () => new Promise(() => {}),
  importExtrinsics: () => {},
  initTx: () => {},
  initTxDynamicInfo: () => {},
  onFilterChange: () => {},
  notifyInvalidExtrinsic: () => {},
  setEstimatedFee: () => new Promise(() => {}),
  setTxDynamicInfo: () => {},
  setTxSignature: () => {},
  submitTx: () => {},
  submitMockTx: () => {},
  updateAccountName: () => new Promise(() => {}),
  updateTxStatus: () => new Promise(() => {}),
  removeExtrinsic: () => new Promise(() => {}),
};
