// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  IntervalSubscription,
  SubscriptionTask,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';

// Context interface.
export interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  dynamicIntervalTasksState: IntervalSubscription[];
  getCategorised: () => Map<TaskCategory, SubscriptionTask[]>;
  setDynamicIntervalTasks: (
    tasks: IntervalSubscription[],
    chainId: ChainID
  ) => void;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
  tryAddIntervalSubscription: (task: IntervalSubscription) => void;
  tryRemoveIntervalSubscription: (task: IntervalSubscription) => void;
  tryUpdateDynamicIntervalTask: (task: IntervalSubscription) => void;
  activeChainId: ChainID | null;
  setActiveChainId: (cid: ChainID) => void;
  getCategorisedDynamicIntervals: () => Map<number, IntervalSubscription[]>;
}
