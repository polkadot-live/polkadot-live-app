// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription, OneShotReturn } from '@polkadot-live/types';

export interface IntervalTaskManagerAdaptor {
  handleRemoveSubscription: (
    task: IntervalSubscription,
    isOnline: boolean
  ) => Promise<void>;
  handleToggleSubscription: (
    task: IntervalSubscription,
    isOnline: boolean
  ) => void;
  handleAnalytics: (task: IntervalSubscription) => void;
  executeOneShot: (task: IntervalSubscription) => Promise<OneShotReturn>;
  onInsertSubscriptions: (
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
  onRemoveSubscription: (task: IntervalSubscription, isOnline: boolean) => void;
  onRemoveSubscriptions: (
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
  onUpdateSubscription: (task: IntervalSubscription) => void;
  updateTask: (task: IntervalSubscription) => void;
}
