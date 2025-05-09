// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@polkadot-live/types/misc';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type {
  IntervalSubscription,
  SubscriptionTask,
  SubscriptionTaskType,
} from '@polkadot-live/types/subscriptions';

export interface ManageProps {
  addresses: FlattenedAccountData[];
}

export interface AccountsProps {
  addresses: FlattenedAccountData[];
  setBreadcrumb: (s: string) => void;
  setSection: (n: number) => void;
  setTypeClicked: (t: SubscriptionTaskType) => void;
  setSelectedAccount: (a: string | null) => void;
}

export interface PermissionsProps {
  breadcrumb: string;
  section: number;
  selectedAccount: string | null;
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
  handleToggle: (task: SubscriptionTask) => Promise<void>;
}

export interface IntervalRowProps {
  task: IntervalSubscription;
}
