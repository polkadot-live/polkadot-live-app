// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@/types/misc';
import type { IntervalSubscription } from '@/types/subscriptions';

export interface IntervalTasksManagerContextInterface {
  handleIntervalToggle: (task: IntervalSubscription) => Promise<void>;
  handleIntervalNativeCheckbox: (
    task: IntervalSubscription,
    flag: boolean
  ) => Promise<void>;
  handleRemoveIntervalSubscription: (
    task: IntervalSubscription
  ) => Promise<void>;
  handleChangeIntervalDuration: (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void
  ) => Promise<void>;
  handleIntervalOneShot: (
    task: IntervalSubscription,
    setOneShotProcessing: AnyFunction
  ) => Promise<void>;
}
