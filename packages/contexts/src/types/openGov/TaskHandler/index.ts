// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReferendaInfo } from '@polkadot-live/types/openGov';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export interface TaskHandlerContextInterface {
  addIntervalSubscription: (
    task: IntervalSubscription,
    referendumInfo: ReferendaInfo
  ) => void;
  removeIntervalSubscription: (
    task: IntervalSubscription,
    referendumInfo: ReferendaInfo
  ) => void;
  addAllIntervalSubscriptions: (
    tasks: IntervalSubscription[],
    referendumInfo: ReferendaInfo
  ) => void;
  removeAllIntervalSubscriptions: (
    tasks: IntervalSubscription[],
    referendumInfo: ReferendaInfo
  ) => void;
}
