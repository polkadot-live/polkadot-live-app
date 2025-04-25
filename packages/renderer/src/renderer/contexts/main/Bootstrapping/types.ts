// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { NodeEndpoint } from '@polkadot-live/types/apis';

export interface BootstrappingInterface {
  appLoading: boolean;
  isAborting: boolean;
  isConnecting: boolean;
  setAppLoading: (b: boolean) => void;
  setIsAborting: (b: boolean) => void;
  setIsConnecting: (b: boolean) => void;
  handleInitializeApp: () => Promise<void>;
  handleInitializeAppOffline: () => Promise<void>;
  handleInitializeAppOnline: () => Promise<void>;
  handleNewEndpointForChain: (
    chainId: ChainID,
    newEndpoint: NodeEndpoint
  ) => Promise<void>;
  syncOpenGovWindow: () => Promise<void>;
}
