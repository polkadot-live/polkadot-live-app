// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@/types/misc';
import type { FlattenedAccountData } from '@/types/accounts';
import type {
  IntervalSubscription,
  SubscriptionTask,
  SubscriptionTaskType,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

export interface ManageProps {
  addresses: FlattenedAccountData[];
}

export interface AccountsProps {
  addresses: FlattenedAccountData[];
  setBreadcrumb: (s: string) => void;
  setSection: (n: number) => void;
  setTypeClicked: (t: SubscriptionTaskType) => void;
}

export interface PermissionsProps {
  breadcrumb: string;
  section: number;
  typeClicked: SubscriptionTaskType;
  setSection: (n: number) => void;
}

export interface PermissionRowProps {
  task: SubscriptionTask;
  getDisabled: (task: SubscriptionTask) => boolean;
  getTaskType: (task: SubscriptionTask) => SubscriptionTaskType;
  handleOneShot: (
    task: SubscriptionTask,
    setOneShotProcessing: AnyFunction,
    nativeChecked: boolean
  ) => Promise<void>;
  handleNativeCheckbox: (
    flag: boolean,
    task: SubscriptionTask,
    setNativeChecked: AnyFunction
  ) => Promise<void>;
  handleToggle: (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction
  ) => Promise<void>;
}

export interface IntervalRowProps {
  task: IntervalSubscription;
  handleIntervalToggle: (task: IntervalSubscription) => Promise<void>;
  handleIntervalNativeCheckbox: (
    task: IntervalSubscription,
    flag: boolean
  ) => Promise<void>;
  handleChangeIntervalDuration: (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void
  ) => void;
  handleIntervalOneShot: (
    task: IntervalSubscription,
    nativeChecked: boolean,
    setOneShotProcessing: (processing: boolean) => void
  ) => Promise<void>;
  handleRemoveIntervalSubscription: (
    task: IntervalSubscription
  ) => Promise<void>;
  isTaskDisabled: () => boolean;
}
