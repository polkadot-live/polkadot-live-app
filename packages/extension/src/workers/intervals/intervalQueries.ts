// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainList } from '@polkadot-live/consts/chains';
import { DbController } from '../../controllers';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export const handleGetAllIntervalTasks = async (): Promise<
  IntervalSubscription[]
> => {
  let tasks: IntervalSubscription[] = [];
  const store = 'intervalSubscriptions';

  for (const key of ChainList.keys()) {
    const fetched =
      ((await DbController.get(store, key)) as
        | IntervalSubscription[]
        | undefined) || [];
    tasks = tasks.concat(fetched);
  }
  return tasks;
};
