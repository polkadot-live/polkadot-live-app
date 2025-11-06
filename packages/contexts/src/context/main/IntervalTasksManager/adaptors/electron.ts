// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ConfigRenderer,
  executeIntervaledOneShot,
  IntervalsController,
} from '@polkadot-live/core';
import type { IntervalTaskManagerAdaptor } from './types';

export const electronAdapter: IntervalTaskManagerAdaptor = {
  handleRemoveSubscription: async (task, isOnline) => {
    task.status === 'enable' &&
      IntervalsController.removeSubscription(task, isOnline);
    task.status = 'disable';

    // Update OpenGov window subscription state.
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:task:removed',
      data: { serialized: JSON.stringify(task) },
    });
    // Remove task from store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:task:remove',
      data: { serialized: JSON.stringify(task) },
    });
  },

  handleToggleSubscription: (task, isOnline) => {
    task.status === 'enable'
      ? IntervalsController.insertSubscription(task, isOnline)
      : IntervalsController.removeSubscription(task, isOnline);
    electronAdapter.handleAnalytics(task);
  },

  handleAnalytics: (task) => {
    const { action, category, status } = task;
    const event = `subscription-interval-${status === 'enable' ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { action, category });
  },

  executeOneShot: async (task) =>
    await executeIntervaledOneShot(task, 'one-shot'),

  onInsertSubscriptions: (tasks, isOnline) => {
    IntervalsController.insertSubscriptions(tasks, isOnline);
  },

  onRemoveSubscription: (task, isOnline) => {
    if (task.status === 'enable') {
      IntervalsController.removeSubscription(task, isOnline);
    }
  },

  onRemoveSubscriptions: (tasks, isOnline) => {
    IntervalsController.removeSubscriptions(tasks, isOnline);
  },

  onUpdateSubscription: (task) => {
    IntervalsController.updateSubscription(task);
  },

  updateTask: (task) => {
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:task:update',
      data: {
        serialized: JSON.stringify(task),
      },
    });
    window.myAPI.sendIntervalTask({
      action: 'interval:task:update',
      data: { serialized: JSON.stringify(task) },
    });
  },
};
