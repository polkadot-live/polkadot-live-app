// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { compare } from './utils';
import { DbController } from '../../controllers';
import { IntervalsController } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { Stores } from '../../controllers';

export const handleAddIntervalSubscriptions = async (
  tasks: IntervalSubscription[],
  onlineMode: boolean
) => {
  for (const task of tasks) {
    await handleAddIntervalSubscription(task, onlineMode);
  }
};

export const handleAddIntervalSubscription = async (
  task: IntervalSubscription,
  onlineMode: boolean
) => {
  IntervalsController.insertSubscription(task, onlineMode);
  // Persist task to store.
  const { chainId } = task;
  const store = 'intervalSubscriptions';
  const all =
    ((await DbController.get(store, chainId)) as
      | IntervalSubscription[]
      | undefined) ?? [];
  const updated = all.filter((t) => !compare(task, t));
  await DbController.set(store, chainId, [...updated, task]);
};

export const handleUpdateIntervalSubscription = async (
  task: IntervalSubscription
) => {
  const { chainId } = task;
  const store: Stores = 'intervalSubscriptions';
  const all = (await DbController.get(store, chainId)) as
    | IntervalSubscription[]
    | undefined;
  if (all) {
    const updated = all.map((t) => (compare(task, t) ? task : t));
    await DbController.set(store, chainId, updated);
  }
};

export const removeAllSubscriptions = async (
  chainId: ChainID,
  refId: number
) => {
  const store: Stores = 'intervalSubscriptions';
  const fetched = (await DbController.get(store, chainId)) as
    | IntervalSubscription[]
    | undefined;

  if (fetched) {
    const updated = fetched.filter((s) => s.referendumId !== refId);
    updated.length
      ? await DbController.set(store, chainId, updated)
      : await DbController.delete(store, chainId);
  }
};
