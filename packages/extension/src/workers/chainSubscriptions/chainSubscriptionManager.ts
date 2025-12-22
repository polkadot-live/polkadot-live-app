// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { SubscriptionsController } from '@polkadot-live/core';
import { updateChainSubscription } from './chainSubscriptionStorage';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Stores } from '../../controllers';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const getAllChainSubscriptions = async (): Promise<
  Map<ChainID, SubscriptionTask[]>
> => {
  const store: Stores = 'chainSubscriptions';
  const map = new Map<ChainID, SubscriptionTask[]>();
  const fetched = (await DbController.getAllObjects(store)) as Map<
    ChainID,
    SubscriptionTask
  >;
  for (const chainId of [
    'Polkadot Relay',
    'Kusama Relay',
    'Paseo Relay',
  ] as ChainID[]) {
    map.set(chainId, []);
  }
  for (const task of fetched.values()) {
    const { chainId } = task;
    map.set(chainId, [...map.get(chainId)!, task]);
  }
  for (const [key, value] of map.entries()) {
    map.set(key, SubscriptionsController.mergeActiveChainTasks(value, key));
  }
  return map;
};

export const updateChainSubscriptions = async (tasks: SubscriptionTask[]) => {
  // Update database.
  for (const task of tasks) {
    await updateChainSubscription(task);
  }
  // Subscribe to tasks.
  await SubscriptionsController.subscribeChainTasks(tasks);
};

export const subscribeChainTask = async (task: SubscriptionTask) => {
  await SubscriptionsController.subscribeChainTasks([task]);
};
