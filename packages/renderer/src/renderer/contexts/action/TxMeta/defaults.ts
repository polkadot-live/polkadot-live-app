// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  addressesInfo: [],
  extrinsics: new Map(),
  pagedExtrinsics: { page: 1, pageCount: 1, items: [] },
  selectedFilter: 'all',
  showMockUI: false,
  getCategoryTitle: () => '',
  getExtrinsicsPage: () => [],
  getFilteredExtrinsics: () => [],
  getGenesisHash: () => null,
  getPageCount: () => 1,
  getPageNumbers: () => [],
  getTxPayload: () => null,
  handleOpenCloseWcModal: () => new Promise(() => {}),
  importExtrinsics: () => {},
  initTx: () => {},
  initTxDynamicInfo: () => {},
  onFilterChange: () => {},
  notifyInvalidExtrinsic: () => {},
  removeExtrinsic: () => new Promise(() => {}),
  setEstimatedFee: () => new Promise(() => {}),
  setPage: () => {},
  setTxDynamicInfo: () => {},
  setTxSignature: () => {},
  submitTx: () => {},
  submitMockTx: () => {},
  updateAccountName: () => new Promise(() => {}),
  updateTxStatus: () => new Promise(() => {}),
};
