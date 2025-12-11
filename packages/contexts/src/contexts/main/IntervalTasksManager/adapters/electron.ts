// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ConfigRenderer,
  executeIntervaledOneShot,
  IntervalsController,
} from '@polkadot-live/core';
import type { IntervalTaskManagerAdapter } from './types';

export const electronAdapter: IntervalTaskManagerAdapter = {
  onRemoveAllSubscriptions: async (chainId, refId, tasks, isOnline) => {
    IntervalsController.removeSubscriptions(tasks, isOnline);

    // Update OpenGov window state.
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:ref:remove',
      data: { chainId, refId },
    });
    // Update store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:tasks:remove',
      data: { chainId, refId },
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
