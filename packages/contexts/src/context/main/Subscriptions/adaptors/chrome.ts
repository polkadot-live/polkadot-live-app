// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, SubscriptionTask } from '@polkadot-live/types';
import type { SubscriptionsAdaptor } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const chromeAdapter: SubscriptionsAdaptor = {
  executeOneShot: async (task) =>
    (await chrome.runtime.sendMessage({
      type: 'oneShot',
      task: 'execute',
      payload: { task },
    })) as boolean,

  getTotalSubscriptionCount: (activeChainMap) =>
    activeChainMap
      ? Array.from(activeChainMap.values()).reduce((acc, n) => acc + n, 0)
      : 0,

  toggleTaskNotifications: async (task, checked) => {
    if (task.account) {
      task.enableOsNotifications = checked;
      await chrome.runtime.sendMessage({
        type: 'accountSubscriptions',
        task: 'notificationToggle',
        payload: { task },
      });
    }
  },

  listenOnMount: (
    setAccountSubscriptionsState,
    setChainSubscriptionsState,
    updateAccountNameInTasks,
    setActiveChainMap
  ) => {
    if (!setActiveChainMap) {
      return null;
    }
    const callback = (message: AnyData) => {
      if (message.type === 'subscriptions') {
        switch (message.task) {
          case 'setChainSubscriptions': {
            const { ser }: { ser: string } = message.payload;
            const array: [ChainID, SubscriptionTask[]][] = JSON.parse(ser);
            const map = new Map<ChainID, SubscriptionTask[]>(array);
            setChainSubscriptionsState(map);
            break;
          }
          case 'setAccountSubscriptions': {
            const parseMap = <K, V>(map: string) => {
              const array: [K, V][] = JSON.parse(map);
              return new Map<K, V>(array);
            };
            const {
              subscriptions,
              activeChains,
            }: { subscriptions: string; activeChains: string } =
              message.payload;

            setAccountSubscriptionsState(
              parseMap<string, SubscriptionTask[]>(subscriptions)
            );
            setActiveChainMap(parseMap<ChainID, number>(activeChains));
            break;
          }
          case 'updateAccountName': {
            const { key, newName }: { key: string; newName: string } =
              message.payload;
            updateAccountNameInTasks(key, newName);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },

  onMount: (_, setChainSubscriptionsState) => {
    chrome.runtime
      .sendMessage({ type: 'chainSubscriptions', task: 'getAll' })
      .then((result: string) => {
        const parseMap = <K, V>(map: string) => {
          const array: [K, V][] = JSON.parse(map);
          return new Map<K, V>(array);
        };
        const parsed = parseMap<ChainID, SubscriptionTask[]>(result);
        setChainSubscriptionsState(parsed);
      });
  },

  handleQueuedToggle: async (
    task,
    taskType,
    renderedSubscriptions,
    setRenderedSubscriptions
  ) => {
    await chromeAdapter.toggleSubscription(
      task,
      taskType,
      renderedSubscriptions,
      setRenderedSubscriptions
    );
  },

  toggleSubscription: async (
    task,
    taskType,
    renderedSubscriptions,
    setRenderedSubscriptions
  ) => {
    const newStatus = task.status === 'enable' ? 'disable' : 'enable';
    task.status = newStatus;
    task.enableOsNotifications = newStatus === 'enable' ? true : false;

    const cmp = (a: SubscriptionTask, b: SubscriptionTask) =>
      a.action === b.action && a.chainId === b.chainId;

    if (setRenderedSubscriptions && renderedSubscriptions) {
      setRenderedSubscriptions({
        type: taskType,
        tasks: renderedSubscriptions.tasks.map((a) =>
          cmp(task, a) ? task : a
        ),
      });
    }
    // Send task and its associated data to backend.
    switch (taskType) {
      case 'chain': {
        await chrome.runtime.sendMessage({
          type: 'chainSubscriptions',
          task: 'update',
          payload: { task },
        });
        break;
      }
      case 'account': {
        await chrome.runtime.sendMessage({
          type: 'accountSubscriptions',
          task: 'update',
          payload: { task },
        });
        break;
      }
      default: {
        return;
      }
    }
  },

  onToggleCategoryTasks: async (
    category,
    isOn,
    renderedSubscriptions,
    getTaskType,
    setRenderedSubscriptions
  ) => {
    // Get all tasks with the target status.
    const targetStatus = isOn ? 'enable' : 'disable';

    // Get rendered tasks in the category with target status and invert it.
    const tasks = renderedSubscriptions.tasks
      .filter((t) => t.category === category && t.status === targetStatus)
      .map((t) => {
        t.status = t.status === 'enable' ? 'disable' : 'enable';
        t.enableOsNotifications = t.status === 'enable' ? true : false;
        return t;
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    // Return early if no tasks to toggle.
    if (tasks.length === 0) {
      return;
    }

    // Utils.
    const taskType = getTaskType(tasks[0]);
    const cmp = (a: SubscriptionTask, b: SubscriptionTask) =>
      a.action === b.action && a.chainId === b.chainId;

    // Update rendered subscriptions.
    if (setRenderedSubscriptions) {
      setRenderedSubscriptions({
        type: taskType,
        tasks: renderedSubscriptions.tasks.map(
          (a) => tasks.find((b) => cmp(a, b)) || a
        ),
      });
    }

    switch (taskType) {
      case 'chain': {
        await chrome.runtime.sendMessage({
          type: 'chainSubscriptions',
          task: 'updateMany',
          payload: { tasks },
        });
        break;
      }
      case 'account': {
        await chrome.runtime.sendMessage({
          type: 'accountSubscriptions',
          task: 'updateMany',
          payload: { tasks },
        });
        break;
      }
      default: {
        return;
      }
    }
  },
};
