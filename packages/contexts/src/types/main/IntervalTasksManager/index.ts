// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export interface IntervalTasksManagerContextInterface {
  isRemoveRefDialogOpen: boolean;
  removeRefData: { refId: number; chainId: ChainID } | null;
  setRemoveRefData: React.Dispatch<
    React.SetStateAction<{ refId: number; chainId: ChainID } | null>
  >;
  setIsRemoveRefDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  insertSubscriptions: (tasks: IntervalSubscription[]) => void;
  handleIntervalToggle: (task: IntervalSubscription) => Promise<void>;
  handleIntervalNativeCheckbox: (
    task: IntervalSubscription,
    flag: boolean,
  ) => Promise<void>;
  handleChangeIntervalDuration: (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void,
  ) => Promise<void>;
  handleIntervalOneShot: (
    task: IntervalSubscription,
    setOneShotProcessing: AnyFunction,
  ) => Promise<void>;
  handleIntervalAnalytics: (task: IntervalSubscription) => void;
  removeSubscriptions: (tasks: IntervalSubscription[]) => void;
  removeAllSubscriptions: (
    chainId: ChainID,
    refId: number,
    tasks: IntervalSubscription[],
  ) => Promise<void>;
  updateIntervalTask: (task: IntervalSubscription) => void;
}
