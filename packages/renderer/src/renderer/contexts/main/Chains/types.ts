// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

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
}
