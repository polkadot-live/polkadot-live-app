// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ApiError } from '@polkadot-live/core';
import type { ApiConnectResult, NodeEndpoint } from '@polkadot-live/types/apis';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ApiHealthContextInterface {
  failedConnections: Map<ChainID, ApiConnectResult<ApiError>>;
  reconnectDialogOpen: boolean;
  footerIsExpanded: boolean;
  setReconnectDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hasConnectionIssue: (chainId: ChainID) => boolean;
  onEndpointChange: (chainId: ChainID, endpoint: NodeEndpoint) => Promise<void>;
  setFailedConnections: React.Dispatch<
    React.SetStateAction<Map<ChainID, ApiConnectResult<ApiError>>>
  >;
  setFooterIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  startApi: (chainId: ChainID) => Promise<void>;
}
