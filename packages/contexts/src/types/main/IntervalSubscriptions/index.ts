// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { ChainID } from '@polkadot-live/types/chains';

export interface IntervalSubscriptionsContextInterface {
  subscriptions: Map<ChainID, IntervalSubscription[]>;
  addIntervalSubscription: (task: IntervalSubscription) => void;
  chainHasIntervalSubscriptions: (chainId: ChainID) => boolean;
  getCategorised: () => Map<number, IntervalSubscription[]>;
  getIntervalSubscriptionsForChain: (
    chainId: ChainID
  ) => IntervalSubscription[];
  getSortedKeys: () => ChainID[];
  getTotalIntervalSubscriptionCount: () => number;
  setSubscriptions: (
    subscriptions: Map<ChainID, IntervalSubscription[]>
  ) => void;
  removeIntervalSubscription: (task: IntervalSubscription) => void;
  updateIntervalSubscription: (task: IntervalSubscription) => void;
}
