// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  disconnectAPIs,
  executeOneShot,
  SubscriptionsController,
  TaskOrchestrator,
  TaskQueue,
  tryApiDisconnect,
} from '@polkadot-live/core';
import type { FlattenedAccountData } from '@polkadot-live/types';
import type { SubscriptionsAdapter } from './types';

export const electronAdapter: SubscriptionsAdapter = {
  executeOneShot: async (task) => {
    const result = await executeOneShot(task);
    if (result) {
      const { action, category } = task;
      window.myAPI.umamiEvent('oneshot-account', { action, category });
    }
    return result;
  },

  getTotalSubscriptionCount: (_, getAllAccounts) => {
    let count = 0;
    if (!getAllAccounts) {
      return count;
    }
    const getSubscriptionCountForAccount = (
      flattened: FlattenedAccountData
    ): number => {
      const { address, chain } = flattened;
      const account = AccountsController.get(chain, address);
      if (!account) {
        return 0;
      }
      const tasks = account.getSubscriptionTasks();
      if (!tasks) {
        return 0;
      }
      return tasks.length;
    };
    for (const flattened of getAllAccounts()) {
      count += getSubscriptionCountForAccount(flattened);
    }
    return count;
  },

  toggleTaskNotifications: async (task, checked) => {
    if (task.account) {
      task.enableOsNotifications = checked;
      await window.myAPI.sendSubscriptionTask({
        action: 'subscriptions:account:update',
        data: {
          serAccount: JSON.stringify(task.account!),
          serTask: JSON.stringify(task),
        },
      });
      SubscriptionsController.updateTaskState(task);
      // Update tasks in query multi wrapper.
      const account = AccountsController.get(
        task.chainId,
        task.account.address
      );
      if (account) {
        account.queryMulti?.setOsNotificationsFlag(task);
      }
    }
  },

  listenOnMount: () => null,

  onMount: (setAccountSubscriptionsState, setChainSubscriptionsState) => {
    SubscriptionsController.setChainSubscriptions = setChainSubscriptionsState;
    SubscriptionsController.setAccountSubscriptions =
      setAccountSubscriptionsState;
  },

  handleQueuedToggle: async (task, taskType) => {
    // Invert the task status.
    const newStatus = task.status === 'enable' ? 'disable' : 'enable';
    task.status = newStatus;
    task.enableOsNotifications = newStatus === 'enable' ? true : false;
    SubscriptionsController.updateTaskState(task);

    const p = async () =>
      await electronAdapter.toggleSubscription(task, taskType);
    TaskQueue.add(p);
  },

  toggleSubscription: async (task, taskType) => {
    switch (taskType) {
      case 'chain': {
        await SubscriptionsController.subscribeChainTasks([task]);
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:chain:update',
          data: { serTask: JSON.stringify(task) },
        });
        break;
      }
      case 'account': {
        const { chainId: cid, account: a } = task;
        const account = AccountsController.get(cid, a?.address);
        if (!account) {
          break;
        }
        // Subscribe and persist task.
        await AccountsController.subscribeTask(task);
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:account:update',
          data: {
            serAccount: JSON.stringify(account.flatten()),
            serTask: JSON.stringify(task),
          },
        });
        // Analytics.
        const { action, category, status } = task;
        const event = `subscription-account-${status === 'enable' ? 'on' : 'off'}`;
        window.myAPI.umamiEvent(event, { action, category });
        break;
      }
      default: {
        return;
      }
    }
    await tryApiDisconnect(task);
  },

  onToggleCategoryTasks: async (
    category,
    isOn,
    renderedSubscriptions,
    getTaskType
  ) => {
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
    switch (getTaskType(tasks[0])) {
      case 'chain': {
        // Update store and React state.
        for (const task of tasks) {
          await window.myAPI.sendSubscriptionTask({
            action: 'subscriptions:chain:update',
            data: { serTask: JSON.stringify(task) },
          });
          SubscriptionsController.updateTaskState(task);
        }
        SubscriptionsController.subscribeChainTasks(tasks);
        break;
      }
      case 'account': {
        // Get associated account.
        const { chainId: cid, account: a } = tasks[0];
        const account = AccountsController.get(cid, a?.address);
        if (!account) {
          return;
        }
        // Update persisted state and React state for tasks.
        for (const task of tasks) {
          await window.myAPI.sendSubscriptionTask({
            action: 'subscriptions:account:update',
            data: {
              serAccount: JSON.stringify(account.flatten()),
              serTask: JSON.stringify(task),
            },
          });
          SubscriptionsController.updateTaskState(task);
        }
        // Subscribe to tasks.
        if (account.queryMulti) {
          await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
        }
        // Analytics.
        const event = `subscriptions-account-category-${targetStatus === 'enable' ? 'off' : 'on'}`;
        const { chain: chainId } = account;
        window.myAPI.umamiEvent(event, { category, chainId });
        break;
      }
      default: {
        return;
      }
    }
    await disconnectAPIs();
  },
};
