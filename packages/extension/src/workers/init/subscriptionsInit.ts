// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { handleGetAllIntervalTasks } from '../intervals';
import { isSystemsInitialized } from '../state';
import {
  AccountsController,
  ExtrinsicsController,
  IntervalsController,
  SubscriptionsController,
  TaskOrchestrator,
} from '@polkadot-live/core';
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
