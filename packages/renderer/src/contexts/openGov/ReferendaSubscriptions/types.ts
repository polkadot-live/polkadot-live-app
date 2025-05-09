// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export interface ReferendaSubscriptionsContextInterface {
  subscriptions: Map<ChainID, IntervalSubscription[]>;
  setSubscriptions: (
    subscriptions: Map<ChainID, IntervalSubscription[]>
  ) => void;
  activeTasksMap: Map<ChainID, Map<number, string[]>>;
  addReferendaSubscription: (task: IntervalSubscription) => void;
  removeReferendaSubscription: (task: IntervalSubscription) => void;
  updateReferendaSubscription: (task: IntervalSubscription) => void;
  isSubscribedToTask: (
    referendum: ReferendaInfo,
    task: IntervalSubscription
  ) => boolean;
  isSubscribedToReferendum: (
    chainId: ChainID,
    referendum: ReferendaInfo
  ) => boolean;
  isNotSubscribedToAny: (chainId: ChainID) => boolean;
  allSubscriptionsAdded: (
    chainId: ChainID,
    referendum: ReferendaInfo
  ) => boolean;
}
