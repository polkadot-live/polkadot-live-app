// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@w3ux/utils/types';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

export interface PermissionRowProps {
  task: SubscriptionTask;
  getDisabled: (task: SubscriptionTask) => boolean;
  getTaskType: (task: SubscriptionTask) => SubscriptionTaskType;
  handleOneShot: (
    task: SubscriptionTask,
    setOneShotProcessing: AnyFunction
  ) => Promise<void>;
  handleNativeCheckbox: (
    e: React.ChangeEvent<HTMLInputElement>,
    task: SubscriptionTask,
    setNativeChecked: AnyFunction
  ) => Promise<void>;
  handleToggle: (cached: WrappedSubscriptionTasks) => Promise<void>;
}
