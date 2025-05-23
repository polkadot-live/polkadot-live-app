// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WcSyncFlags } from '@polkadot-live/types/walletConnect';

export interface ConnectionsContextInterface {
  isConnected: boolean;
  isImporting: boolean;
  isImportingAccount: boolean;
  isOnlineMode: boolean;
  darkMode: boolean;
  isBuildingExtrinsic: boolean;
  wcSyncFlags: WcSyncFlags;
  getOnlineMode: () => boolean;
}
