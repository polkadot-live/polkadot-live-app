// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';

export interface SubscriptionsContextInterface {
  chainSubscriptions: Map<ChainID, SubscriptionTask[]>;
  accountSubscriptions: Map<string, SubscriptionTask[]>;
  chainHasSubscriptions: (chainId: ChainID) => boolean;
  getChainSubscriptions: (a: ChainID) => SubscriptionTask[];
  getAccountSubscriptions: (key: string) => SubscriptionTask[];
  onOneShot: (
    task: SubscriptionTask,
    setOneShotProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    nativeChecked: boolean
  ) => Promise<void>;
  onNotificationToggle: (
    checked: boolean,
    task: SubscriptionTask
  ) => Promise<void>;
  updateAccountNameInTasks: (key: string, newName: string) => void;
  handleQueuedToggle: (task: SubscriptionTask) => Promise<void>;
  toggleCategoryTasks: (c: TaskCategory, i: boolean) => Promise<void>;
  getTaskType: (t: SubscriptionTask) => SubscriptionTaskType;
}
