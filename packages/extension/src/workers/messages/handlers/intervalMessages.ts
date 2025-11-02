// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { IntervalsController } from '@polkadot-live/core';
import {
  handleAddIntervalSubscription,
  handleAddIntervalSubscriptions,
  handleGetAllIntervalTasks,
  handleRemoveIntervalSubscription,
  handleRemoveIntervalSubscriptions,
  handleUpdateIntervalSubscription,
} from '../../intervals';
import type { AnyData } from '@polkadot-live/types/misc';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export const handleIntervalMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'add': {
      const {
        task,
        onlineMode,
      }: { task: IntervalSubscription; onlineMode: boolean } = message.payload;
      handleAddIntervalSubscription(task, onlineMode);
      return false;
    }
    case 'addMulti': {
      const {
        tasks,
        onlineMode,
      }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
        message.payload;
      handleAddIntervalSubscriptions(tasks, onlineMode);
      return false;
    }
    case 'getAll': {
      handleGetAllIntervalTasks().then((result: IntervalSubscription[]) =>
        sendResponse(result)
      );
      return true;
    }
    case 'removeMulti': {
      const {
        tasks,
        onlineMode,
      }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
        message.payload;
      handleRemoveIntervalSubscriptions(tasks, onlineMode);
      return false;
    }
    case 'delete': {
      const {
        task,
        onlineMode,
      }: { task: IntervalSubscription; onlineMode: boolean } = message.payload;

      IntervalsController.removeSubscription(task, onlineMode);
      handleRemoveIntervalSubscription(task);
      return false;
    }
    case 'insertSubscription': {
      const {
        task,
        onlineMode,
      }: { task: IntervalSubscription; onlineMode: boolean } = message.payload;
      IntervalsController.insertSubscription(task, onlineMode);
      return false;
    }
    case 'insertSubscriptions': {
      const {
        tasks,
        onlineMode,
      }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
        message.payload;
      IntervalsController.insertSubscriptions(tasks, onlineMode);
      return false;
    }
    case 'remove': {
      const {
        task,
        onlineMode,
      }: { task: IntervalSubscription; onlineMode: boolean } = message.payload;
      task.status === 'enable' &&
        IntervalsController.removeSubscription(task, onlineMode);
      handleRemoveIntervalSubscription(task);
      return false;
    }
    case 'removeSubscription': {
      const {
        task,
        onlineMode,
      }: { task: IntervalSubscription; onlineMode: boolean } = message.payload;
      IntervalsController.removeSubscription(task, onlineMode);
      return false;
    }
    case 'removeSubscriptions': {
      const {
        tasks,
        onlineMode,
      }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
        message.payload;
      IntervalsController.removeSubscriptions(tasks, onlineMode);
      return false;
    }
    case 'update': {
      const { task }: { task: IntervalSubscription } = message.payload;
      handleUpdateIntervalSubscription(task).then(() =>
        IntervalsController.updateSubscription(task)
      );
      return false;
    }
    default: {
      console.warn(`Unknown interval task: ${message.task}`);
      return false;
    }
  }
};
