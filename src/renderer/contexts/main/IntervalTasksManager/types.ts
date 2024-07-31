// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@/types/subscriptions';

export interface IntervalTasksManagerContextInterface {
  handleIntervalToggle: (task: IntervalSubscription) => Promise<void>;
  handleIntervalNativeCheckbox: (
    task: IntervalSubscription,
    flag: boolean
  ) => Promise<void>;
}
