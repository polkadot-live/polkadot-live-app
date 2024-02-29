// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Api } from '@/renderer/model/Api';
import type { ChainID } from '@/types/chains';

export interface APIsContextInterface {
  instances: Api[];
  updateInstances: ((instance: Api[]) => void) | null;
  initializeAPIs: ((chainIds: ChainID[]) => Promise<void>) | null;
  disconnectApi: ((chain: ChainID) => Promise<void>) | null;
  fetchConnectedApi: ((chainId: ChainID) => Promise<Api>) | null;
}
