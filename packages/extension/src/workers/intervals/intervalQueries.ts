// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export const handleGetAllIntervalTasks = async (): Promise<
  IntervalSubscription[]
> => {
  let tasks: IntervalSubscription[] = [];
  const store = 'intervalSubscriptions';
  const chainIds: ChainID[] = ['Polkadot Asset Hub', 'Kusama Asset Hub'];
  for (const key of chainIds) {
    const fetched =
      ((await DbController.get(store, key)) as
        | IntervalSubscription[]
        | undefined) || [];
    tasks = tasks.concat(fetched);
  }
  return tasks;
};
