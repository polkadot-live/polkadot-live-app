// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, IntervalSubscription } from '@polkadot-live/types';

export interface TaskHandlerAdapter {
  addReferendumSubscriptions: (
    refId: number,
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
  handleAnalytics: (event: string, data: AnyData | null) => void;
  removeReferendumSubscriptions: (
    refId: number,
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
}
