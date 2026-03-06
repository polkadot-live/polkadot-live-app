// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ActiveSubCounts,
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainEventsContextInterface {
  selectedRef: number | null;
  refHasActiveSubs: (chainId: ChainID, refId: number) => boolean;
  setSelectedRef: React.Dispatch<React.SetStateAction<number | null>>;

  activeChain: ChainID | null;
  activeAccount: FlattenedAccountData | null;
  activeRefChain: ChainID | null;
  refSubscriptions: Map<ChainID, Map<number, ChainEventSubscription[]>>;
  subscriptions: Map<ChainID, ChainEventSubscription[]>;
  accountHasSubs: (account: FlattenedAccountData) => boolean;
  accountSubCountForPallet: (pallet: string) => number;
  accountSubCount: (account: FlattenedAccountData) => Promise<number>;
  addSubsForRef: (chainId: ChainID, refId: number) => void;
  countActiveRefSubs: () => number;
  fetchAccountStats: () => Promise<Record<string, ActiveSubCounts>>;
  fetchNetworkStats: () => Promise<Record<string, ActiveSubCounts>>;
  getCategorisedForAccount: (
    account: FlattenedAccountData,
  ) => Record<string, ChainEventSubscription[]>;
  getActiveRefIds: () => Promise<string[]>;
  getCategorisedRefsForChain: () => ChainEventSubscription[];
  getEventSubscriptionCount: () => Promise<number>;
  isApiRequired: (chainId: ChainID) => boolean;
  refActiveSubCount: (refId: number) => number;
  removeAllForAccount: (account: FlattenedAccountData) => void;
  removeSubsForRef: (chainId: ChainID, refId: number) => void;
  setActiveAccount: React.Dispatch<
    React.SetStateAction<FlattenedAccountData | null>
  >;
  setActiveChain: React.Dispatch<React.SetStateAction<ChainID | null>>;
  setActiveRefChain: React.Dispatch<React.SetStateAction<ChainID | null>>;
  syncAccounts: (accounts: FlattenedAccountData[]) => Promise<void>;
  syncRefs: () => Promise<void>;
  syncStored: () => Promise<void>;
  toggle: (sub: ChainEventSubscription) => Promise<void>;
  toggleForAccount: (sub: ChainEventSubscription) => Promise<void>;
  toggleOsNotify: (sub: ChainEventSubscription, updateStore?: boolean) => void;
}
