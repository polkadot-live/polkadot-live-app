// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription, OneShotReturn } from '@polkadot-live/types';

export interface IntervalTaskManagerAdapter {
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
  onRemoveSubscriptions: (
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => void;
  onRemoveAllSubscriptions: (
    chainId: ChainID,
    refId: number,
    tasks: IntervalSubscription[],
    isOnline: boolean
  ) => Promise<void>;
  onUpdateSubscription: (task: IntervalSubscription) => void;
  updateTask: (task: IntervalSubscription) => void;
}
