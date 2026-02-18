// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainEventsAdapter {
  listenOnMount: (
    removeAllForAccount: (account: FlattenedAccountData) => void,
  ) => (() => void) | null;
  getStored: () => Promise<Map<ChainID, ChainEventSubscription[]>>;
  getStoredForAccount: (
    account: FlattenedAccountData,
  ) => Promise<ChainEventSubscription[]>;
  getActiveRefIds: () => Promise<string[]>;
  getAllRefSubs: () => Promise<
    Record<string, Record<number, ChainEventSubscription[]>>
  >;
  getStoredRefSubsForChain: (
    chainId: ChainID,
  ) => Promise<ChainEventSubscription[]>;
  getSubCount: () => Promise<number>;
  getSubCountForAccount: (account: FlattenedAccountData) => Promise<number>;
  storeInsert: (chainId: ChainID, subscription: ChainEventSubscription) => void;
  storeInsertForAccount: (
    account: FlattenedAccountData,
    subscription: ChainEventSubscription,
  ) => void;
  storeRemove: (chainId: ChainID, subscription: ChainEventSubscription) => void;
  storeRemoveForAccount: (
    account: FlattenedAccountData,
    subscription: ChainEventSubscription,
  ) => void;
  storeRemoveAllForAccount: (account: FlattenedAccountData) => void;
  toggleNotify: (
    chainId: ChainID,
    subscription: ChainEventSubscription,
  ) => void;
  toggleNotifyForAccount: (
    account: FlattenedAccountData,
    subscription: ChainEventSubscription,
  ) => void;
  toggleNotifyForRef: (
    chainId: ChainID,
    refId: number,
    subscription: ChainEventSubscription,
  ) => void;
  storeInsertForRef: (
    chainId: ChainID,
    refId: number,
    subscriptions: ChainEventSubscription[],
  ) => void;
  storeRemoveForRef: (
    chainId: ChainID,
    refId: number,
    subscriptions: ChainEventSubscription[],
  ) => void;
}
