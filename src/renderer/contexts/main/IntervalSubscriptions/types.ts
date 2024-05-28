// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { ChainID } from '@/types/chains';

export interface IntervalSubscriptionsContextInterface {
  subscriptions: Map<ChainID, IntervalSubscription[]>;
  setSubscriptions: (
    subscriptions: Map<ChainID, IntervalSubscription[]>
  ) => void;
  addIntervalSubscription: (task: IntervalSubscription) => void;
  removeIntervalSubscription: (task: IntervalSubscription) => void;
  getIntervalSubscriptionsForChain: (
    chainId: ChainID
  ) => IntervalSubscription[];
}
