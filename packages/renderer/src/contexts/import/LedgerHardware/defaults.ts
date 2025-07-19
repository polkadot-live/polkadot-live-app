// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { LedgerHardwareContextInterface } from './types';

export const defaultLedgerHardwareContext: LedgerHardwareContextInterface = {
  connectedNetwork: '',
  deviceConnected: false,
  isFetching: false,
  isImporting: false,
  pageIndex: 0,
  receivedAddresses: [],
  selectedAddresses: [],
  selectedNetworkState: '',
  lastStatusCode: null,
  clearCaches: () => {},
  disableConnect: () => false,
  fetchLedgerAddresses: () => new Promise(() => {}),
  getChecked: () => false,
  getImportLabel: () => '',
  resetAll: () => {},
  setIsImporting: () => {},
  setPageIndex: () => {},
  setSelectedNetwork: () => {},
  updateSelectedAddresses: () => {},
};
