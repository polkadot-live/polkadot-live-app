// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
  statusCodes: [],
  clearCaches: () => {},
  disableConnect: () => false,
  fetchLedgerAddresses: () => {},
  getChecked: () => false,
  getImportLabel: () => '',
  resetAll: () => {},
  setIsImporting: () => {},
  setPageIndex: () => {},
  setSelectedNetwork: () => {},
  updateSelectedAddresses: () => {},
};
