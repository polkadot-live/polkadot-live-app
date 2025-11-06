// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalTaskManagerAdaptor } from './types';
import type { OneShotReturn } from '@polkadot-live/types';

export const chromeAdapter: IntervalTaskManagerAdaptor = {
  handleRemoveSubscription: async (task, isOnline) => {
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'remove',
      payload: { task, onlineMode: isOnline },
    });
    try {
      chrome.runtime.sendMessage({
        type: 'intervalSubscriptions',
        task: 'syncIntervalSubscriptionRemove',
        payload: { task },
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

  handleAnalytics: () => {
    /* empty */
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

  onRemoveSubscription: () => {
    /* empty */
  },

  onRemoveSubscriptions: (tasks, isOnline) => {
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'removeSubscriptions',
      payload: { tasks, onlineMode: isOnline },
    });
  },

  onUpdateSubscription: () => {
    /* empty */
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
