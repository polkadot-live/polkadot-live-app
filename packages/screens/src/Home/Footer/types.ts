// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData, NodeEndpoint } from '@polkadot-live/types/apis';
import type { SyncID } from '@polkadot-live/types';

export interface SelectRpcProps {
  apiData: FlattenedAPIData;
  disabled: boolean;
  onEndpointChange: (chainId: ChainID, endpoint: NodeEndpoint) => Promise<void>;
  cacheGet: (key: SyncID) => boolean;
  setWorkingEndpoint?: (chainId: ChainID, val: boolean) => void;
}
