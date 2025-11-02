// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController, getFromBackupFile } from '@polkadot-live/core';
import {
  setAccountSubscriptionsState,
  subscribeAccountTask,
  updateAccountSubscription,
} from '../subscriptions';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const updateTaskEntries = () => {
  for (const [chainId, managed] of AccountsController.accounts.entries()) {
    for (const account of managed) {
      const flattened = account.flatten();
      account.queryMulti?.updateEntryAccountData(chainId, flattened);
    }
  }
};

export const importAccountTaskData = async (contents: string) => {
  const serTasks = getFromBackupFile('accountTasks', contents);
  if (!serTasks) {
    return;
  }
  const arr: [string, SubscriptionTask[]][] = JSON.parse(serTasks);
  const map = new Map<string, SubscriptionTask[]>(arr);

  for (const [key, parsed] of map.entries()) {
    if (parsed.length === 0) {
      continue;
    }
    const [chainId, address] = key.split(':', 2);
    const account = AccountsController.get(chainId as ChainID, address);
    if (account) {
      for (const t of parsed) {
        // Throw away task if necessary.
        if (
          (t.category === 'Nomination Pools' && !account.nominationPoolData) ||
          (t.category === 'Nominating' && !account.nominatingData)
        ) {
          continue;
        }
        // Otherwise subscribe to task.
        await updateAccountSubscription(account, t);
        await subscribeAccountTask(t);
      }
    }
  }
  await setAccountSubscriptionsState();
};
