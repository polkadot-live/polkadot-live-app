// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { LedgerHardwareContextInterface } from './types';

export const defaultLedgerHardwareContext: LedgerHardwareContextInterface = {
  isFetching: false,
  isImporting: false,
  deviceConnected: false,
  statusCodes: [],
  statusCodesRef: null,
  setIsFetching: () => {},
  setIsImporting: () => {},
  setDeviceConnected: () => {},
  setStatusCodes: () => {},
  handleNewStatusCode: () => {},
  fetchLedgerAddresses: () => {},
  networkData: [],
};
