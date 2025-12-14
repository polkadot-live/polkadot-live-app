// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TaskHandlerAdapter } from './types';

export const chromeAdapter: TaskHandlerAdapter = {
  handleAnalytics: () => {
    /* empty */
  },

  addReferendumSubscriptions: (refId, tasks, _isOnline, chainId) =>
    chrome.runtime.sendMessage({
      type: 'subscriptions',
      task: 'addReferendumSubscriptions',
      payload: { chainId, refId, tasks },
    }),

  removeReferendumSubscriptions: (refId, _tasks, _isOnline, chainId) =>
    chrome.runtime.sendMessage({
      type: 'subscriptions',
      task: 'removeReferendumSubscriptions',
      payload: { chainId, refId },
    }),
};
