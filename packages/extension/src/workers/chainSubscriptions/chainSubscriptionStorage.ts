// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const updateChainSubscription = async (task: SubscriptionTask) => {
  const { action, chainId, status } = task;
  const key = `${chainId}:${action}`;
  const store = 'chainSubscriptions';

  if (status === 'enable') {
    await DbController.set(store, key, task);
  } else {
    const maybeTask = await DbController.get(store, key);
    if (maybeTask !== undefined) {
      await DbController.delete(store, key);
    }
  }
};
