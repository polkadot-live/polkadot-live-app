// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { Dispatch, SetStateAction } from 'react';
import type {
  FlattenedAccountData,
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types';

export interface SubscriptionsAdaptor {
  executeOneShot: (task: SubscriptionTask) => Promise<boolean>;

  getTotalSubscriptionCount: (
    activeChainMap?: Map<ChainID, number>,
    getAllAccounts?: () => FlattenedAccountData[]
  ) => number;

  toggleTaskNotifications: (
    task: SubscriptionTask,
    checked: boolean
  ) => Promise<void>;

  listenOnMount: (
    setAccountSubscriptionsState: (
      value: SetStateAction<Map<string, SubscriptionTask[]>>
    ) => void,
    setChainSubscriptionsState: (
      value: SetStateAction<Map<ChainID, SubscriptionTask[]>>
    ) => void,
    updateAccountNameInTasks: (key: string, newName: string) => void,
    setActiveChainMap?: (value: SetStateAction<Map<ChainID, number>>) => void
  ) => (() => void) | null;

  onMount: (
    setAccountSubscriptionsState: Dispatch<
      SetStateAction<Map<string, SubscriptionTask[]>>
    >,
    setChainSubscriptionsState: Dispatch<
      SetStateAction<Map<ChainID, SubscriptionTask[]>>
    >
  ) => void;

  handleQueuedToggle: (
    task: SubscriptionTask,
    taskType: SubscriptionTaskType,
    renderedSubscriptions?: WrappedSubscriptionTasks,
    setRenderedSubscriptions?: (a: WrappedSubscriptionTasks) => void
  ) => Promise<void>;

  toggleSubscription: (
    task: SubscriptionTask,
    taskType: SubscriptionTaskType,
    renderedSubscriptions?: WrappedSubscriptionTasks,
    setRenderedSubscriptions?: (a: WrappedSubscriptionTasks) => void
  ) => Promise<void>;

  onToggleCategoryTasks: (
    category: TaskCategory,
    isOn: boolean,
    renderedSubscriptions: WrappedSubscriptionTasks,
    getTaskType: (task: SubscriptionTask) => SubscriptionTaskType,
    setRenderedSubscriptions?: (a: WrappedSubscriptionTasks) => void
  ) => Promise<void>;
}
