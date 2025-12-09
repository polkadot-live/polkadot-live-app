// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  SubscriptionTask,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';

// Context interface.
export interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  getCategorised: () => Map<TaskCategory, SubscriptionTask[]>;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
}
