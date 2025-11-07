// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, IntervalSubscription } from '@polkadot-live/types';
import type { ReferendaSubscriptionsAdapter } from './types';

export const chromeAdapter: ReferendaSubscriptionsAdapter = {
  fetchOnMount: async () => {
    const result = (await chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'getAll',
    })) as IntervalSubscription[];
    return result;
  },

  listenOnMount: (
    addReferendaSubscription,
    removeReferendaSubscription,
    updateReferendaSubscription
  ) => {
    // Return early if setters not provided.
    if (
      !(
        addReferendaSubscription &&
        removeReferendaSubscription &&
        updateReferendaSubscription
      )
    ) {
      return null;
    }

    const callback = (message: AnyData) => {
      if (message.type === 'intervalSubscriptions') {
        switch (message.task) {
          case 'import:setSubscriptions': {
            const { tasks }: { tasks: IntervalSubscription[] } =
              message.payload;
            for (const task of tasks) {
              removeReferendaSubscription(task);
              task.status === 'enable' && addReferendaSubscription(task);
            }
            break;
          }
          case 'syncIntervalSubscriptionUpdate': {
            const { task }: { task: IntervalSubscription } = message.payload;
            updateReferendaSubscription(task);
            break;
          }
          case 'syncIntervalSubscriptionRemove': {
            const { task }: { task: IntervalSubscription } = message.payload;
            removeReferendaSubscription(task);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
