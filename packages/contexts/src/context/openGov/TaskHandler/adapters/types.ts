// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, IntervalSubscription } from '@polkadot-live/types';

export interface TaskHandlerAdapter {
  addIntervalSubscriptionMessage: (
    task: IntervalSubscription,
    isOnline: boolean
  ) => void;
  addIntervalSubscriptionsMessage: (
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
  handleAnalytics: (event: string, data: AnyData | null) => void;
  removeIntervalSubscriptionMessage: (task: IntervalSubscription) => void;
  removeIntervalSubscriptionsMessage: (
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
}
