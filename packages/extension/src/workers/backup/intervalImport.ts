// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { getFromBackupFile, IntervalsController } from '@polkadot-live/core';
import {
  handleAddIntervalSubscription,
  handleGetAllIntervalTasks,
  handleUpdateIntervalSubscription,
} from '../intervals';
import { sendChromeMessage } from '../utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export const importIntervalData = async (
  contents: string,
  isOnline: boolean
) => {
  const serIntervals = getFromBackupFile('intervals', contents);
  if (!serIntervals) {
    return;
  }
  type M = Map<ChainID, IntervalSubscription[]>;
  const store = 'intervalSubscriptions';
  const fetched = (await DbController.getAllObjects(store)) as M;

  const alreadyExists = (interval: IntervalSubscription) => {
    const { action, chainId } = interval;
    return Boolean(
      fetched
        .get(chainId)
        ?.find((t) => t.action === action && t.chainId === chainId)
    );
  };

  const parsed: IntervalSubscription[] = JSON.parse(serIntervals);
  for (const interval of parsed) {
    alreadyExists(interval)
      ? await handleUpdateIntervalSubscription(interval)
      : await handleAddIntervalSubscription(interval, isOnline);

    // Remove task if it's already managed and re-add it.
    IntervalsController.removeSubscription(interval, isOnline);
    IntervalsController.insertSubscription(interval, isOnline);
  }
  // Update state in popup and OpenGov window.
  sendChromeMessage('intervalSubscriptions', 'import:setSubscriptions', {
    tasks: await handleGetAllIntervalTasks(),
  });
};
