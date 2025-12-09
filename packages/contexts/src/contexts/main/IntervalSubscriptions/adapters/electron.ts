// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types';
import type { IntervalSubscriptionsAdapter } from './types';

export const electronAdapter: IntervalSubscriptionsAdapter = {
  getIntervalSubs: async () => {
    const result = (await window.myAPI.sendIntervalTask({
      action: 'interval:task:get',
      data: null,
    })) as string;
    const tasks: IntervalSubscription[] = result ? JSON.parse(result) : [];
    return tasks;
  },

  listenOnMount: () => null,

  onMount: () => {
    /* empty */
  },
};
