// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TaskHandlerAdapter } from './types';

export const chromeAdapter: TaskHandlerAdapter = {
  addIntervalSubscriptionMessage: (task, isOnline) =>
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'add',
      payload: { task, onlineMode: isOnline },
    }),

  addIntervalSubscriptionsMessage: (tasks, isOnline) =>
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'addMulti',
      payload: { tasks, onlineMode: isOnline },
    }),

  handleAnalytics: () => {
    /* empty */
  },

  removeIntervalSubscriptionMessage: (task) =>
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'delete',
      payload: { task },
    }),

  removeIntervalSubscriptionsMessage: (tasks, isOnline) =>
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'removeMulti',
      payload: { tasks, onlineMode: isOnline },
    }),
};
