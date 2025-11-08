// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  SubscriptionsController,
} from '@polkadot-live/core';
import { DbController } from '../../controllers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

// Get active account subscriptions from database and merge with inactive.
export const getAllAccountSubscriptions = async () => {
  const store = 'accountSubscriptions';
  const active = (await DbController.getAllObjects(store)) as Map<
    string,
    SubscriptionTask[]
  >;
  const result: typeof active = new Map();
  for (const [key, tasks] of active.entries()) {
    const [chainId, address] = key.split(':');
    const account = AccountsController.get(chainId as ChainID, address);
    if (account) {
      result.set(key, SubscriptionsController.mergeActive(account, tasks));
    }
  }
  return result;
};
