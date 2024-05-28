// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

// Context interface.
export interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  dynamicIntervalTasksState: IntervalSubscription[];
  setDynamicIntervalTasks: (tasks: IntervalSubscription[]) => void;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
  updateRenderedSubscriptions: (a: SubscriptionTask) => void;
  updateDynamicIntervalTask: (task: IntervalSubscription) => void;
  tryAddIntervalSubscription: (task: IntervalSubscription) => void;
  tryRemoveIntervalSubscription: (action: string, referendumId: number) => void;
  activeChainId: ChainID;
  setActiveChainId: (cid: ChainID) => void;
  getCategorizedDynamicIntervals: () => Map<number, IntervalSubscription[]>;
}
