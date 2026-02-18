// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OneShotReturn } from '@polkadot-live/types';
import type { IntervalTaskManagerAdapter } from './types';

export const chromeAdapter: IntervalTaskManagerAdapter = {
  handleAnalytics: () => {
    /* empty */
  },

  onUpdateSubscription: () => {
    /* empty */
  },

  onRemoveAllSubscriptions: async (chainId, refId, tasks) => {
    chrome.runtime.sendMessage({
      type: 'subscriptions',
      task: 'removeReferendumSubscriptions',
      payload: { chainId, refId },
    });

    // Sync OpenGov view.
    try {
      chrome.runtime.sendMessage({
        type: 'intervalSubscriptions',
        task: 'syncRemoveAllSubscriptions',
        payload: { tasks },
      });
    } catch (error) {
      console.error(error);
    }
  },

  handleToggleSubscription: async (task, isOnline) => {
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task:
        task.status === 'enable' ? 'insertSubscription' : 'removeSubscription',
      payload: { task, onlineMode: isOnline },
    });
  },

  executeOneShot: async (task) =>
    (await chrome.runtime.sendMessage({
      type: 'oneShot',
      task: 'executeInterval',
      payload: { task },
    })) as OneShotReturn,

  onInsertSubscriptions: (tasks, isOnline) => {
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'insertSubscriptions',
      payload: { tasks, onlineMode: isOnline },
    });
  },

  onRemoveSubscriptions: (tasks, isOnline) => {
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'removeSubscriptions',
      payload: { tasks, onlineMode: isOnline },
    });
  },

  updateTask: (task) => {
    try {
      chrome.runtime.sendMessage({
        type: 'intervalSubscriptions',
        task: 'syncIntervalSubscriptionUpdate',
        payload: { task },
      });
    } catch (error) {
      console.error(error);
    }
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'update',
      payload: { task },
    });
  },
};
