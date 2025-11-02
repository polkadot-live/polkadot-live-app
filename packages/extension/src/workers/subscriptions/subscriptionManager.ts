// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  disconnectAPIs,
  TaskOrchestrator,
  tryApiDisconnect,
} from '@polkadot-live/core';
import { DbController } from '../../controllers';
import { setAccountSubscriptionsState } from './subscriptionMessaging';
import type { Account } from '@polkadot-live/core';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const onNotificationToggle = async (task: SubscriptionTask) => {
  const { chainId, account: flattened } = task;
  const account = AccountsController.get(chainId, flattened?.address);
  if (!account) {
    return;
  }
  account.queryMulti?.setOsNotificationsFlag(task);
  await updateAccountSubscription(account, task);
  await setAccountSubscriptionsState();
};

export const updateAccountSubscriptions = async (tasks: SubscriptionTask[]) => {
  const { chainId, account: flattened } = tasks[0];
  const account = AccountsController.get(chainId, flattened?.address);
  if (!account) {
    return;
  }
  // Update database.
  for (const task of tasks) {
    await updateAccountSubscription(account, task);
  }
  // Subscribe to tasks.
  if (account.queryMulti) {
    await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
  }
  // Disconnect unused APIs.
  await disconnectAPIs();
};

export const updateAccountSubscription = async (
  account: Account,
  task: SubscriptionTask
) => {
  const { address, chain: chainId } = account;
  const { action, status } = task;
  const key = `${chainId}:${address}`;
  const store = 'accountSubscriptions';

  const fetched = await DbController.get(store, key);
  const tasks = (fetched || []) as SubscriptionTask[];
  const filtered = tasks.filter((t) => t.action !== action);

  status === 'enable'
    ? await DbController.set(store, key, [...filtered, task])
    : await DbController.set(store, key, [...filtered]);
};

export const subscribeAccountTask = async (task: SubscriptionTask) => {
  await AccountsController.subscribeTask(task);
  await tryApiDisconnect(task);
};
