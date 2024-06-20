// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@w3ux/utils/types';
import type { ChainID } from '@/types/chains';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

export interface SubscriptionsContextInterface {
  chainSubscriptions: Map<ChainID, SubscriptionTask[]>;
  accountSubscriptions: Map<string, SubscriptionTask[]>;
  setChainSubscriptions: (a: Map<ChainID, SubscriptionTask[]>) => void;
  getChainSubscriptions: (a: ChainID) => SubscriptionTask[];
  setAccountSubscriptions: (a: Map<string, SubscriptionTask[]>) => void;
  getAccountSubscriptions: (a: string) => SubscriptionTask[];
  updateTask: (type: string, task: SubscriptionTask, address?: string) => void;
  updateAccountNameInTasks: (address: string, newName: string) => void;
  handleQueuedToggle: (cached: WrappedSubscriptionTasks) => Promise<void>;
  toggleCategoryTasks: (
    c: TaskCategory,
    i: boolean,
    s: WrappedSubscriptionTasks,
    u: AnyFunction
  ) => Promise<void>;
  getTaskType: (t: SubscriptionTask) => SubscriptionTaskType;
}
