// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';

export interface SubscriptionsContextInterface {
  chainSubscriptions: Map<ChainID, SubscriptionTask[]>;
  accountSubscriptions: Map<string, SubscriptionTask[]>;
  chainHasSubscriptions: (chainId: ChainID) => boolean;
  getChainSubscriptions: (a: ChainID) => SubscriptionTask[];
  getAccountSubscriptions: (a: string) => SubscriptionTask[];
  updateTask: (type: string, task: SubscriptionTask, address?: string) => void;
  updateAccountNameInTasks: (address: string, newName: string) => void;
  handleQueuedToggle: (task: SubscriptionTask) => Promise<void>;
  toggleCategoryTasks: (
    c: TaskCategory,
    i: boolean,
    s: WrappedSubscriptionTasks,
    u: AnyFunction
  ) => Promise<void>;
  getTaskType: (t: SubscriptionTask) => SubscriptionTaskType;
}
