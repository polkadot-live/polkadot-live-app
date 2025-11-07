// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ApiConnectResult, NodeEndpoint } from '@polkadot-live/types';
import type { ApiError } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SetStateAction } from 'react';

export interface ApiHealthAdapter {
  onEndpointChange: (chainId: ChainID, endpoint: NodeEndpoint) => Promise<void>;
  onMount: (
    setFailedConnections: (
      value: SetStateAction<Map<ChainID, ApiConnectResult<ApiError>>>
    ) => void
  ) => (() => void) | null;
  startApi: (
    chainId: ChainID,
    failedConnections?: Map<ChainID, ApiConnectResult<ApiError>>
  ) => Promise<void>;
}
