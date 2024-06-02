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
  activeTasksMap: Map<number, string[]>;
  setActiveTasksMap: (activeTasks: Map<number, string[]>) => void;
  addReferendaSubscription: (task: IntervalSubscription) => void;
  removeReferendaSubscription: (task: IntervalSubscription) => void;
  updateReferendaSubscription: (task: IntervalSubscription) => void;
  isSubscribedToTask: (
    referendum: ActiveReferendaInfo,
    task: IntervalSubscription
  ) => boolean;
}
