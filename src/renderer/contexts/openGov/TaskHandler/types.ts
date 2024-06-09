// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveReferendaInfo } from '@/types/openGov';
import type { IntervalSubscription } from '@/types/subscriptions';

export interface TaskHandlerContextInterface {
  addIntervalSubscription: (
    task: IntervalSubscription,
    referendumInfo: ActiveReferendaInfo
  ) => void;
  removeIntervalSubscription: (
    task: IntervalSubscription,
    referendumInfo: ActiveReferendaInfo
  ) => void;
  addAllIntervalSubscriptions: (
    tasks: IntervalSubscription[],
    referendumInfo: ActiveReferendaInfo
  ) => void;
  removeAllIntervalSubscriptions: (
    tasks: IntervalSubscription[],
    referendumInfo: ActiveReferendaInfo
  ) => void;
}
