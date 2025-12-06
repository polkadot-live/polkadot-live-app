// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types';
import type { TaskHandlerAdapter } from './types';

export const electronAdapter: TaskHandlerAdapter = {
  addIntervalSubscriptionMessage: (task) => {
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:add',
      data: {
        task: JSON.stringify(task),
      },
    });
  },

  addIntervalSubscriptionsMessage: (refId, tasks) => {
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:add:multi',
      data: {
        refId,
        tasks: JSON.stringify(tasks),
      },
    });
  },

  handleAnalytics: (event: string, data: AnyData | null) => {
    window.myAPI.umamiEvent(event, data);
  },

  removeIntervalSubscriptionMessage: (task) => {
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:remove',
      data: {
        task: JSON.stringify(task),
      },
    });
  },

  removeIntervalSubscriptionsMessage: (refId, tasks) => {
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:remove:multi',
      data: {
        refId,
        tasks: JSON.stringify(tasks),
      },
    });
  },
};
