// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { handleGetAllIntervalTasks } from '../intervals';
import { isSystemsInitialized } from '../state';
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
  await TaskOrchestrator.buildTasks(tasks, queryMulti);
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
  for (const [cid, sub] of stored.entries()) {
    ChainEventsService.insert(cid as ChainID, sub);
  }
};

export const startEventStreams = async () => {
  // Start event streams.
  for (const cid of ChainEventsService.activeSubscriptions.keys()) {
    await ChainEventsService.initEventStream(cid as ChainID);
  }
};
