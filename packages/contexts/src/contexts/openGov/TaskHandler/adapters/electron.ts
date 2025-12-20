// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types';
import type { TaskHandlerAdapter } from './types';

export const electronAdapter: TaskHandlerAdapter = {
  addReferendumSubscriptions: (refId, tasks) => {
    ConfigTabs.portToMain.postMessage({
      task: 'openGov:subscriptions:add',
      data: { refId, tasks: JSON.stringify(tasks) },
    });
  },

  handleAnalytics: (event: string, data: AnyData | null) => {
    window.myAPI.umamiEvent(event, data);
  },

  removeReferendumSubscriptions: (refId, tasks) => {
    ConfigTabs.portToMain.postMessage({
      task: 'openGov:subscriptions:remove',
      data: { refId, tasks: JSON.stringify(tasks) },
    });
  },
};
