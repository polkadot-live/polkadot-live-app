// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainEventsAdapter {
  getStored: () => Promise<Map<ChainID, ChainEventSubscription[]>>;
  getStoredForAccount: (
    account: FlattenedAccountData
  ) => Promise<ChainEventSubscription[]>;
  getSubCount: () => Promise<number>;
  storeInsert: (chainId: ChainID, subscription: ChainEventSubscription) => void;
  storeInsertForAccount: (
    account: FlattenedAccountData,
    subscription: ChainEventSubscription
  ) => void;
  storeRemove: (chainId: ChainID, subscription: ChainEventSubscription) => void;
  storeRemoveForAccount: (
    account: FlattenedAccountData,
    subscription: ChainEventSubscription
  ) => void;
  toggleNotify: (
    chainId: ChainID,
    subscription: ChainEventSubscription
  ) => void;
  toggleNotifyForAccount: (
    account: FlattenedAccountData,
    subscription: ChainEventSubscription
  ) => void;
}
