// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  ChainEventsService,
  ExtrinsicsController,
  IntervalsController,
  SubscriptionsController,
  TaskOrchestrator,
} from '@polkadot-live/core';
import { DbController } from '../../controllers';
import { getAllChainEventsForAccount, getAllRefSubs } from '../chainEvents';
import { handleGetAllIntervalTasks } from '../intervals';
import { isSystemsInitialized } from '../state';
import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';
import type { Stores } from '../../controllers';

export const initAccountSubscriptions = async () => {
  if (isSystemsInitialized()) {
    return;
  }
  type T = Map<string, SubscriptionTask[]>;
  const store = 'accountSubscriptions';
  const active = (await DbController.getAllObjects(store)) as T;
  const backend = 'browser';

  ExtrinsicsController.backend = backend;
  SubscriptionsController.backend = backend;
  await AccountsController.initAccountSubscriptions('browser', active);
};

export const initChainSubscriptions = async () => {
  if (isSystemsInitialized()) {
    return;
  }
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
  if (isSystemsInitialized()) {
    return;
  }
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
  // Insert chain-scoped subscriptions.
  for (const [key, sub] of stored.entries()) {
    const cid = key.split('::')[0] as ChainID;
    ChainEventsService.insert(cid, sub);
  }
  // Insert account-scoped subscriptions.
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
  // Insert referenda-scoped subscriptions.
  for (const [chainId, recRefs] of Object.entries(await getAllRefSubs())) {
    for (const [refId, subs] of Object.entries(recRefs)) {
      subs
        .filter((s) => s.enabled && s.kind === 'referendum')
        .forEach((s) => {
          const cid = chainId as ChainID;
          !activeChainIds.includes(cid) && activeChainIds.push(cid);
          ChainEventsService.insertRefScoped(parseInt(refId, 10), s);
        });
    }
  }
};

export const startEventStreams = async () => {
  // Account-scoped active chains.
  const activeChainIds: ChainID[] = [];
  for (const accounts of AccountsController.accounts.values()) {
    for (const account of accounts) {
      const subs = await getAllChainEventsForAccount(account);
      subs.length && activeChainIds.push(account.chain);
    }
  }
  // Referenda-scoped active chains.
  for (const recRefs of Object.values(await getAllRefSubs())) {
    for (const subs of Object.values(recRefs)) {
      subs
        .filter((s) => s.enabled && s.kind === 'referendum')
        .forEach((s) => {
          !activeChainIds.includes(s.chainId) && activeChainIds.push(s.chainId);
        });
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
