// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useState } from 'react';
import { TaskQueue } from '@ren/orchestrators/TaskQueue';
import * as ApiUtils from '@ren/utils/ApiUtils';
import * as defaults from './defaults';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReactNode } from 'react';
import type { SubscriptionsContextInterface } from './types';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';
import { SubscriptionsController } from '@ren/controller/SubscriptionsController';
import { AccountsController } from '@ren/controller/AccountsController';
import { TaskOrchestrator } from '@ren/orchestrators/TaskOrchestrator';

export const SubscriptionsContext =
  createContext<SubscriptionsContextInterface>(
    defaults.defaultSubscriptionsContext
  );

export const useSubscriptions = () => useContext(SubscriptionsContext);

export const SubscriptionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  /// Store received chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  /// Store received account subscriptions (key is account address).
  const [accountSubscriptionsState, setAccountSubscriptionsState] = useState<
    Map<string, SubscriptionTask[]>
  >(new Map());

  useEffect(() => {
    SubscriptionsController.setChainSubscriptions = setChainSubscriptionsState;
    SubscriptionsController.setAccountSubscriptions =
      setAccountSubscriptionsState;
  }, []);

  /// Determine if there are active subscriptions for a network.
  const chainHasSubscriptions = (chainId: ChainID) => {
    const accounts = AccountsController.accounts.get(chainId);
    if (!accounts) {
      return false;
    }

    for (const acc of accounts) {
      const tasks = acc.getSubscriptionTasks();
      if (tasks && tasks.length > 0) {
        return true;
      }
    }

    return false;
  };

  /// Update cached account name for an account's subscription tasks.
  const updateAccountNameInTasks = (address: string, newName: string) => {
    const tasks = accountSubscriptionsState.get(address);

    if (!tasks) {
      return;
    }

    setAccountSubscriptionsState((prev) => {
      prev.set(
        address,
        tasks.map((t) => ({ ...t, account: { ...t.account!, name: newName } }))
      );
      return prev;
    });
  };

  /// Get subscription tasks for a specific chain.
  const getChainSubscriptions = (chainId: ChainID) => {
    const subscriptions = chainSubscriptionsState.get(chainId);
    return subscriptions ? subscriptions : [];
  };

  /// Get subscription tasks for a specific account.
  const getAccountSubscriptions = (address: string) => {
    const subscriptions = accountSubscriptionsState.get(address);
    return subscriptions ? subscriptions : [];
  };

  /// Update state of a task.
  /// TODO: Remove `!` non-null assertions.
  const updateTask = (
    type: string,
    task: SubscriptionTask,
    address?: string
  ) => {
    if (type === 'account') {
      setAccountSubscriptionsState((prev) => {
        const tasks = prev.get(address!);
        !tasks
          ? prev.set(address!, [{ ...task }])
          : prev.set(
              address!,
              tasks.map((t) => (t.action === task.action ? task : t))
            );

        return prev;
      });
    } else {
      setChainSubscriptionsState((prev) => {
        const tasks = prev.get(task.chainId)!;
        prev.set(
          task.chainId,
          tasks.map((t) => (t.action === task.action ? task : t))
        );
        return prev;
      });
    }
  };

  /// Return the type of subscription based on its action string.
  const getTaskType = (task: SubscriptionTask): SubscriptionTaskType =>
    task.action.startsWith('subscribe:account') ? 'account' : 'chain';

  /// Handle toggling on all subscriptions in a category.
  const toggleCategoryTasks = async (
    category: TaskCategory,
    isOn: boolean,
    rendererdSubscriptions: WrappedSubscriptionTasks,
    updateRenderedSubscriptions: AnyFunction
  ) => {
    // Get all tasks with the target status.
    const targetStatus = isOn ? 'enable' : 'disable';

    // Get rendered tasks in the category with target status and invert it.
    const tasks = rendererdSubscriptions.tasks
      .filter((t) => t.category === category && t.status === targetStatus)
      .map((t) => {
        t.status = t.status === 'enable' ? 'disable' : 'enable';
        t.enableOsNotifications = t.status === 'enable' ? true : false;
        return t;
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    // Return early if there are no tasks to toggle.
    if (tasks.length === 0) {
      return;
    }

    switch (getTaskType(tasks[0])) {
      case 'chain': {
        // Update persisted state and React state for tasks.
        for (const task of tasks) {
          await window.myAPI.sendSubscriptionTask({
            action: 'subscriptions:chain:update',
            data: { serTask: JSON.stringify(task) },
          });
          updateTask('chain', task);
          updateRenderedSubscriptions(task);
        }

        // Subscribe to tasks.
        SubscriptionsController.subscribeChainTasks(tasks);
        break;
      }
      case 'account': {
        // Get associated account.
        const account = AccountsController.get(
          tasks[0].chainId,
          tasks[0].account?.address
        );

        // Return early if account not found.
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

          updateTask('account', task, task.account?.address);
          updateRenderedSubscriptions(task);
        }

        // Subscribe to tasks.
        account.queryMulti &&
          (await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti));

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

    // Disconnect from API instance if there are no tasks that require it.
    await ApiUtils.disconnectAPIs();
  };

  /// Execute queued subscription task.
  const handleQueuedToggle = async (task: SubscriptionTask) => {
    const p = async () => await toggleSubscription(task);
    TaskQueue.add(p);
  };

  /// Handle subscription task toggle.
  const toggleSubscription = async (task: SubscriptionTask) => {
    // Invert the task status.
    const newStatus = task.status === 'enable' ? 'disable' : 'enable';
    task.status = newStatus;
    task.enableOsNotifications = newStatus === 'enable' ? true : false;

    // Send task and its associated data to backend.
    switch (getTaskType(task)) {
      case 'chain': {
        // Subscribe to and persist task.
        await SubscriptionsController.subscribeChainTask(task);
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:chain:update',
          data: { serTask: JSON.stringify(task) },
        });

        // Update react state.
        updateTask('chain', task);
        break;
      }
      case 'account': {
        // Fetch account task belongs to.
        const account = AccountsController.get(
          task.chainId,
          task.account?.address
        );

        if (!account) {
          break;
        }

        // Subscribe to and persist the task.
        await SubscriptionsController.subscribeAccountTask(task, account);

        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:account:update',
          data: {
            serAccount: JSON.stringify(account.flatten()),
            serTask: JSON.stringify(task),
          },
        });

        // Update react state.
        updateTask('account', task, task.account?.address);

        // Analytics.
        const { action, category } = task;
        const event = `subscription-account-${newStatus === 'enable' ? 'on' : 'off'}`;
        window.myAPI.umamiEvent(event, { action, category });
        break;
      }
      default: {
        return;
      }
    }

    // Disconnect from API instance if there are no tasks that require it.
    await ApiUtils.checkAndHandleApiDisconnect(task);
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        chainSubscriptions: chainSubscriptionsState,
        accountSubscriptions: accountSubscriptionsState,
        chainHasSubscriptions,
        getChainSubscriptions,
        getAccountSubscriptions,
        updateTask,
        updateAccountNameInTasks,
        handleQueuedToggle,
        toggleCategoryTasks,
        getTaskType,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};
