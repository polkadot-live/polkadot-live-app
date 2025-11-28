// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainEventsContextInterface {
  activeChain: ChainID | null;
  activeAccount: FlattenedAccountData | null;
  subscriptions: Map<ChainID, ChainEventSubscription[]>;
  getCategorisedForAccount: (
    account: FlattenedAccountData
  ) => Record<string, ChainEventSubscription[]>;
  getEventSubscriptionCount: () => Promise<number>;
  setActiveAccount: React.Dispatch<
    React.SetStateAction<FlattenedAccountData | null>
  >;
  setActiveChain: React.Dispatch<React.SetStateAction<ChainID | null>>;
  toggle: (sub: ChainEventSubscription) => Promise<void>;
  toggleForAccount: (sub: ChainEventSubscription) => Promise<void>;
  toggleOsNotify: (sub: ChainEventSubscription, updateStore?: boolean) => void;
  toggleOsNotifyForAccount: (
    sub: ChainEventSubscription,
    updateStore?: boolean
  ) => void;
}
