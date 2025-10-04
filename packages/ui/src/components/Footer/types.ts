// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ApiError } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { darkTheme } from '@polkadot-live/styles/theme/variables';
import type {
  ApiConnectResult,
  FlattenedAPIData,
  NodeEndpoint,
} from '@polkadot-live/types/apis';
import type { SyncID } from '@polkadot-live/types';

export interface FooterProps {
  bootstrappingCtx: {
    appLoading: boolean;
    isConnecting: boolean;
    isAborting: boolean;
  };
  apiHealthCtx: {
    failedConnections: Map<ChainID, ApiConnectResult<ApiError>>;
    hasConnectionIssue: (chainId: ChainID) => boolean;
    onEndpointChange: (
      chainId: ChainID,
      endpoint: NodeEndpoint
    ) => Promise<void>;
  };
  chainsCtx: {
    chains: Map<ChainID, FlattenedAPIData>;
    isWorking: (chainId: ChainID) => boolean;
    onConnectClick: (chainId: ChainID) => Promise<void>;
    onDisconnectClick: (chainId: ChainID) => Promise<void>;
    setWorkingEndpoint: (chainId: ChainID, val: boolean) => void;
    showWorkingSpinner: () => boolean;
  };
  connectionsCtx: {
    getOnlineMode: () => boolean;
    getTheme: () => typeof darkTheme;
    cacheGet: (key: SyncID) => boolean;
  };
  intervalSubscriptionsCtx: {
    chainHasIntervalSubscriptions: (chainId: ChainID) => boolean;
  };
  subscriptionsCtx: {
    chainHasSubscriptions: (chainId: ChainID) => boolean;
  };
}

export interface SelectRpcProps {
  apiData: FlattenedAPIData;
  disabled: boolean;
  onEndpointChange: (chainId: ChainID, endpoint: NodeEndpoint) => Promise<void>;
  cacheGet: (key: SyncID) => boolean;
  setWorkingEndpoint?: (chainId: ChainID, val: boolean) => void;
}
