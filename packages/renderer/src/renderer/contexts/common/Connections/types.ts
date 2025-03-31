// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WcSyncFlags } from '@polkadot-live/types/walletConnect';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ConnectionsContextInterface {
  activeAPIs: Map<ChainID, number>;
  isConnected: boolean;
  isImporting: boolean;
  isOnlineMode: boolean;
  darkMode: boolean;
  isBuildingExtrinsic: boolean;
  wcSyncFlags: WcSyncFlags;
  relayActiveAPI: (chainId: ChainID, dir: 'inc' | 'dec') => void;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOnlineMode: React.Dispatch<React.SetStateAction<boolean>>;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  getOnlineMode: () => boolean;
  setIsBuildingExtrinsic: React.Dispatch<React.SetStateAction<boolean>>;
}
