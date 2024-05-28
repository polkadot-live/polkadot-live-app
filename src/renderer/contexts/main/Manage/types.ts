// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

// Context interface.
export interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  intervalTasksState: IntervalSubscription[];
  setIntervalTasks: (tasks: IntervalSubscription[]) => void;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
  updateRenderedSubscriptions: (a: SubscriptionTask) => void;
  updateIntervalTask: (task: IntervalSubscription) => void;
}
