// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ConnectionsContextInterface } from './types';

export const defaultConnectionsContext: ConnectionsContextInterface = {
  isConnected: false,
  isImporting: false,
  isOnlineMode: false,
  darkMode: true,
  isBuildingExtrinsic: false,
  wcSyncFlags: {
    wcConnecting: false,
    wcDisconnecting: false,
    wcInitialized: false,
    wcSessionRestored: false,
    wcAccountApproved: false,
    wcVerifyingAccount: false,
  },
  setIsConnected: (b) => {},
  setIsImporting: (b) => {},
  setIsOnlineMode: (b) => {},
  setDarkMode: (b) => {},
  getOnlineMode: () => true,
  setIsBuildingExtrinsic: (b) => {},
};
