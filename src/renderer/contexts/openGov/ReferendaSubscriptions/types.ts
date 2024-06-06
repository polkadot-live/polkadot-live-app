// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { IntervalSubscription } from '@/types/subscriptions';

export interface ReferendaSubscriptionsContextInterface {
  subscriptions: Map<ChainID, IntervalSubscription[]>;
  setSubscriptions: (
    subscriptions: Map<ChainID, IntervalSubscription[]>
  ) => void;
  activeTasksMap: Map<ChainID, Map<number, string[]>>;
  addReferendaSubscription: (task: IntervalSubscription) => void;
  removeReferendaSubscription: (task: IntervalSubscription) => void;
  updateReferendaSubscription: (task: IntervalSubscription) => void;
  isSubscribedToTask: (
    referendum: ActiveReferendaInfo,
    task: IntervalSubscription
  ) => boolean;
  isSubscribedToReferendum: (
    chainId: ChainID,
    referendum: ActiveReferendaInfo
  ) => boolean;
  isNotSubscribedToAny: (chainId: ChainID) => boolean;
  allSubscriptionsAdded: (
    chainId: ChainID,
    referendum: ActiveReferendaInfo
  ) => boolean;
}
