// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainEventsContextInterface {
  activeChain: ChainID | null;
  subscriptions: Map<ChainID, ChainEventSubscription[]>;
  setActiveChain: React.Dispatch<React.SetStateAction<ChainID | null>>;
  setSubscriptions: React.Dispatch<
    React.SetStateAction<Map<ChainID, ChainEventSubscription[]>>
  >;
  toggle: (subscription: ChainEventSubscription) => Promise<void>;
  toggleOsNotify: (sub: ChainEventSubscription, updateStore?: boolean) => void;
}
