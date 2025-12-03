// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { getAllChainEventsForAccount } from '../chainEvents';
import { handleGetAllIntervalTasks } from '../intervals';
import {
  AccountsController,
  ChainEventsService,
  ExtrinsicsController,
  IntervalsController,
  SubscriptionsController,
  TaskOrchestrator,
} from '@polkadot-live/core';
import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Stores } from '../../controllers';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const initAccountSubscriptions = async () => {
  type T = Map<string, SubscriptionTask[]>;
  const store = 'accountSubscriptions';
  const active = (await DbController.getAllObjects(store)) as T;
  const backend = 'browser';

  ExtrinsicsController.backend = backend;
  SubscriptionsController.backend = backend;
  await AccountsController.initAccountSubscriptions('browser', active);
};

export const initChainSubscriptions = async () => {
  const store: Stores = 'chainSubscriptions';
  const fetched = (await DbController.getAllObjects(store)) as Map<
    string,
    SubscriptionTask
  >;
  const tasks = Array.from(fetched.values()).map((t) => t);
  const queryMulti = SubscriptionsController.chainSubscriptions;
  await TaskOrchestrator.subscribeTasks(tasks, queryMulti);
};

export const initIntervalSubscriptions = async () => {
  const tasks = await handleGetAllIntervalTasks();
  const isOnline = navigator.onLine;
  IntervalsController.insertSubscriptions(tasks, isOnline);
};

export const initEventSubscriptions = async () => {
  // Get stored chain event subscriptions.
  const store: Stores = 'chainEvents';
  const stored = (await DbController.getAllObjects(store)) as Map<
    string,
    ChainEventSubscription
  >;
  // Insert subscriptions.
  for (const [key, sub] of stored.entries()) {
    const cid = key.split('::')[0] as ChainID;
    ChainEventsService.insert(cid, sub);
  }
  // Insert stored account-scoped chain event subscriptions.
  const activeChainIds: ChainID[] = [];
  for (const accounts of AccountsController.accounts.values()) {
    for (const account of accounts) {
      const flat = account.flatten();
      const subs = await getAllChainEventsForAccount(account);
      subs.length && activeChainIds.push(flat.chain);
      for (const sub of subs) {
        ChainEventsService.insertForAccount(flat, sub);
      }
    }
  }
};

export const startEventStreams = async () => {
  // Get active chains for account-scoped subscriptions.
  const activeChainIds: ChainID[] = [];
  for (const accounts of AccountsController.accounts.values()) {
    for (const account of accounts) {
      const subs = await getAllChainEventsForAccount(account);
      subs.length && activeChainIds.push(account.chain);
    }
  }
  // Start event streams.
  for (const cid of new Set([
    ...ChainEventsService.activeSubscriptions.keys(),
    ...activeChainIds,
  ])) {
    await ChainEventsService.initEventStream(cid as ChainID);
  }
};
