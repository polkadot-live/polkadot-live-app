// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types';
import type { ReferendaSubscriptionsAdapter } from './types';

export const electronAdapter: ReferendaSubscriptionsAdapter = {
  fetchOnMount: async () => {
    const serialized =
      (await window.myAPI.sendIntervalTask({
        action: 'interval:task:get',
        data: null,
      })) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);
    return tasks;
  },
  listenOnMount: () => null,
};
