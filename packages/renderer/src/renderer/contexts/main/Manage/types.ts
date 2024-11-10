// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  IntervalSubscription,
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';

// Context interface.
export interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  dynamicIntervalTasksState: IntervalSubscription[];
  setDynamicIntervalTasks: (
    tasks: IntervalSubscription[],
    chainId: ChainID
  ) => void;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
  updateRenderedSubscriptions: (a: SubscriptionTask) => void;
  tryAddIntervalSubscription: (task: IntervalSubscription) => void;
  tryRemoveIntervalSubscription: (task: IntervalSubscription) => void;
  tryUpdateDynamicIntervalTask: (task: IntervalSubscription) => void;
  activeChainId: ChainID | null;
  setActiveChainId: (cid: ChainID) => void;
  getCategorizedDynamicIntervals: () => Map<number, IntervalSubscription[]>;
}
