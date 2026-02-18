// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, IntervalSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface TaskHandlerAdapter {
  addReferendumSubscriptions: (
    refId: number,
    tasks: IntervalSubscription[],
    isOnline: boolean,
    chainId?: ChainID,
  ) => void;
  handleAnalytics: (event: string, data: AnyData | null) => void;
  removeReferendumSubscriptions: (
    refId: number,
    tasks: IntervalSubscription[],
    isOnline: boolean,
    chainId?: ChainID,
  ) => void;
}
