// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useState } from 'react';
import { TaskQueue } from '@/orchestrators/TaskQueue';
import * as ApiUtils from '@/utils/ApiUtils';
import * as defaults from './defaults';
import type { AnyFunction } from '@w3ux/utils/types';
import type { ChainID } from '@/types/chains';
import type { ReactNode } from 'react';
import type { SubscriptionsContextInterface } from './types';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { useChains } from '../Chains';
import { APIsController } from '@/controller/renderer/APIsController';
import { TaskOrchestrator } from '@/orchestrators/TaskOrchestrator';

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
  const { addChain } = useChains();

  /// Store received chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  /// Store received account subscriptions (key is account address).
  const [accountSubscriptionsState, setAccountSubscriptionsState] = useState<
    Map<string, SubscriptionTask[]>
  >(new Map());

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

  /// Set chain subscription tasks.
  const setChainSubscriptions = (
    subscriptions: Map<ChainID, SubscriptionTask[]>
  ) => {
    setChainSubscriptionsState(subscriptions);
  };

  /// Get subscription tasks for a specific chain.
  const getChainSubscriptions = (chainId: ChainID) => {
    const subscriptions = chainSubscriptionsState.get(chainId);
    return subscriptions ? subscriptions : [];
  };

  /// Set subscription tasks for all accounts.
  const setAccountSubscriptions = (
    subscriptions: Map<string, SubscriptionTask[]>
  ) => {
    // Set new state for imported accounts and their subscriptions.
    setAccountSubscriptionsState((prev) => {
      prev.clear();

      for (const [address, tasks] of subscriptions.entries()) {
        prev.set(address, tasks);
      }

      return prev;
    });
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
        const tasks = prev.get(address!)!;
        prev.set(
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
    category: string,
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
        t.enableOsNotifications = false;
        return t;
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    // Return early if there are no tasks to toggle.
    if (tasks.length === 0) {
      return;
    }

    // Switch subscription type.
    switch (getTaskType(tasks[0])) {
      case 'chain': {
        // Update persisted state and React state for tasks.
        for (const task of tasks) {
          await window.myAPI.updatePersistedChainTask(task);
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
          await window.myAPI.updatePersistedAccountTask(
            JSON.stringify(task),
            JSON.stringify(account.flatten())
          );
          updateTask('account', task, task.account?.address);
          updateRenderedSubscriptions(task);
        }

        // Subscribe to tasks.
        account.queryMulti &&
          (await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti));

        break;
      }
      default: {
        return;
      }
    }

    // Disconnect from API instance if there are no tasks that require it.
    await ApiUtils.handleApiDisconnects();

    // Update chain state.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }
  };

  /// Execute queued subscription task.
  const handleQueuedToggle = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction | null
  ) => {
    const p = async () => await toggleSubscription(cached, setNativeChecked);
    TaskQueue.add(p);
  };

  /// Handle subscription task toggle.
  const toggleSubscription = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction | null
  ) => {
    // Invert the task status.
    const task: SubscriptionTask = { ...cached.tasks[0] };
    task.status = task.status === 'enable' ? 'disable' : 'enable';
    task.enableOsNotifications = false;

    // Send task and its associated data to backend.
    switch (cached.type) {
      case 'chain': {
        // Subscribe to and persist task.
        await SubscriptionsController.subscribeChainTask(task);
        await window.myAPI.updatePersistedChainTask(task);

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

        // Render checbox correctly.
        if (setNativeChecked) {
          setNativeChecked(false);
        }

        await window.myAPI.updatePersistedAccountTask(
          JSON.stringify(task),
          JSON.stringify(account.flatten())
        );

        // Update react state.
        updateTask('account', task, task.account?.address);

        break;
      }
      default: {
        return;
      }
    }

    // Disconnect from API instance if there are no tasks that require it.
    await ApiUtils.checkAndHandleApiDisconnect(task);

    // Update chain state.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        chainSubscriptions: chainSubscriptionsState,
        accountSubscriptions: accountSubscriptionsState,
        setChainSubscriptions,
        getChainSubscriptions,
        setAccountSubscriptions,
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
