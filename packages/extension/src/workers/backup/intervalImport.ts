// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getFromBackupFile, IntervalsController } from '@polkadot-live/core';
import { DbController } from '../../controllers';
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
  isOnline: boolean,
) => {
  const serIntervals = getFromBackupFile('intervals', contents);
  if (!serIntervals) {
    return;
  }
  type M = Map<ChainID, IntervalSubscription[]>;
  const store = 'intervalSubscriptions';
  const fetched = (await DbController.getAllObjects(store)) as M;

  const alreadyExists = (interval: IntervalSubscription) => {
    const { action, chainId, referendumId } = interval;
    return Boolean(
      fetched
        .get(chainId)
        ?.find(
          (t) =>
            t.action === action &&
            t.chainId === chainId &&
            t.referendumId === referendumId,
        ),
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

  // Persist active refIds to database.
  const refIds = parsed
    .map((t) => ({ chainId: t.chainId, refId: t.referendumId }))
    .filter(({ refId }) => refId !== undefined)
    .filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (v) => v.chainId === value.chainId && v.refId === value.refId,
        ),
    )
    .map(({ chainId, refId }) => `${chainId}::${refId}`);

  type T = string[] | undefined;
  const existing = ((await DbController.get('activeRefIds', 'all')) as T) ?? [];
  const next = Array.from(new Set([...existing, ...refIds]));
  await DbController.set('activeRefIds', 'all', next);

  // Update state in popup and OpenGov window.
  sendChromeMessage('intervalSubscriptions', 'import:setSubscriptions', {
    tasks: await handleGetAllIntervalTasks(),
  });
};
