// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { SetStateAction } from 'react';
import type { IntervalSubscription } from '@polkadot-live/types';

export interface IntervalSubscriptionsAdaptor {
  listenOnMount: (
    setSubscriptions: (
      value: SetStateAction<Map<ChainID, IntervalSubscription[]>>
    ) => void
  ) => (() => void) | null;

  onMount: (
    addIntervalSubscription?: (task: IntervalSubscription) => void,
    tryAddIntervalSubscription?: (task: IntervalSubscription) => void
  ) => void;

  onRemoveInterval: (
    task?: IntervalSubscription,
    tryRemoveIntervalSubscription?: (task: IntervalSubscription) => void
  ) => void;
}
