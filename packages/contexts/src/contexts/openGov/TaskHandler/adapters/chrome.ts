// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TaskHandlerAdapter } from './types';

export const chromeAdapter: TaskHandlerAdapter = {
  addReferendumSubscriptions: (_, tasks, isOnline) =>
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'addMulti',
      payload: { tasks, onlineMode: isOnline },
    }),

  handleAnalytics: () => {
    /* empty */
  },

  removeReferendumSubscriptions: (_, tasks, isOnline) =>
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'removeMulti',
      payload: { tasks, onlineMode: isOnline },
    }),
};
