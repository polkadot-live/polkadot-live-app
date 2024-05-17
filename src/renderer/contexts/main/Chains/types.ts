// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from '@/types/chains';
import type { FlattenedAPIData } from '@/types/apis';

/**
 * @deprecated This type should no longer be used.
 */
export interface ChainInstance {
  name: string;
  status: ChainStatus;
}

export interface ChainsContextInterface {
  chains: Map<ChainID, FlattenedAPIData>;
  addChain: (data: FlattenedAPIData) => void;
  removeChain: (chain: ChainID) => void;
  getChain: (chain: ChainID) => FlattenedAPIData | undefined;
  setChain: (data: FlattenedAPIData) => void;
}
