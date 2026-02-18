// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export interface ReferendaSubscriptionsContextInterface {
  subscriptions: Map<ChainID, IntervalSubscription[]>;
  addReferendaSubscription: (task: IntervalSubscription) => void;
  isAdded: (referendum: ReferendaInfo, chainId: ChainID) => boolean;
  removeRef: (chainId: ChainID, refId: number) => void;
  removeReferendaSubscription: (task: IntervalSubscription) => void;
  setSubscriptions: (
    subscriptions: Map<ChainID, IntervalSubscription[]>,
  ) => void;
  updateReferendaSubscription: (task: IntervalSubscription) => void;
}
