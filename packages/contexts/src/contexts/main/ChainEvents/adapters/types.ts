// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainEventsAdapter {
  getStored: () => Promise<Map<ChainID, ChainEventSubscription[]>>;
  storeInsert: (chainId: ChainID, subscription: ChainEventSubscription) => void;
  storeRemove: (chainId: ChainID, subscription: ChainEventSubscription) => void;
  toggleNotify: (
    chainId: ChainID,
    subscription: ChainEventSubscription
  ) => void;
}
