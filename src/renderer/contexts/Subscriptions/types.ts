// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';

export interface SubscriptionsContextInterface {
  chainSubscriptions: Map<ChainID, SubscriptionTask[]>;
  accountSubscriptions: Map<string, SubscriptionTask[]>;
  setChainSubscriptions: (a: Map<ChainID, SubscriptionTask[]>) => void;
  getChainSubscriptions: (a: ChainID) => SubscriptionTask[];
  setAccountSubscriptions: (a: Map<string, SubscriptionTask[]>) => void;
  getAccountSubscriptions: (a: string) => SubscriptionTask[];
  updateTask: (type: string, task: SubscriptionTask, address?: string) => void;
}
