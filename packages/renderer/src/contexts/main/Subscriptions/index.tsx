// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Core from '@polkadot-live/core';
import { createContext, useEffect, useState } from 'react';
import {
  createSafeContextHook,
  useAddresses,
  useConnections,
} from '@polkadot-live/contexts';
import { useManage } from '@ren/contexts/main/Manage';
import { renderToast } from '@polkadot-live/ui/utils';
import {
  AccountsController,
  TaskOrchestrator,
  TaskQueue,
  SubscriptionsController,
} from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type { ReactNode } from 'react';
import type { SubscriptionsContextInterface } from '@polkadot-live/contexts/types/main';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';

export const SubscriptionsContext = createContext<
  SubscriptionsContextInterface | undefined
>(undefined);

export const useSubscriptions = createSafeContextHook(
  SubscriptionsContext,
  'SubscriptionsContext'
);

export const SubscriptionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { getAllAccounts } = useAddresses();
  const { umamiEvent } = useConnections();
  const { renderedSubscriptions } = useManage();

  /// Store chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  /// Store account subscriptions (key is {chainId}:{address}).
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
  const updateAccountNameInTasks = (key: string, newName: string) => {
    const tasks = accountSubscriptionsState.get(key);
    if (!tasks) {
      return;
    }
    setAccountSubscriptionsState((prev) => {
      prev.set(
        key,
        tasks.map((t) => ({ ...t, account: { ...t.account!, name: newName } }))
      );
      return prev;
    });
  };

  /// Get subscription tasks for a specific chain.
  const getChainSubscriptions = (chainId: ChainID) =>
    chainSubscriptionsState.get(chainId) || [];

  /// Get subscription tasks for a specific account.
  const getAccountSubscriptions = (key: string) =>
    accountSubscriptionsState.get(key) || [];

  /// Return the type of subscription based on its action string.
  const getTaskType = (task: SubscriptionTask): SubscriptionTaskType =>
    task.action.startsWith('subscribe:account') ? 'account' : 'chain';

  /// Handle toggling on all subscriptions in a category.
  const toggleCategoryTasks = async (category: TaskCategory, isOn: boolean) => {
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
          SubscriptionsController.updateTaskState(task);
        }

        // Subscribe to tasks.
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

    // Disconnect from API instance if there are no tasks that require it.
    await Core.disconnectAPIs();
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
        await SubscriptionsController.subscribeChainTasks([task]);
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:chain:update',
          data: { serTask: JSON.stringify(task) },
        });

        SubscriptionsController.updateTaskState(task);
        break;
      }
      case 'account': {
        // Fetch account task belongs to.
        const { chainId: cid, account: a } = task;
        const account = AccountsController.get(cid, a?.address);
        if (!account) {
          break;
        }

        // Subscribe to and persist the task.
        await AccountsController.subscribeTask(task);
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:account:update',
          data: {
            serAccount: JSON.stringify(account.flatten()),
            serTask: JSON.stringify(task),
          },
        });
        SubscriptionsController.updateTaskState(task);

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
    await Core.tryApiDisconnect(task);
  };

  /// Handle notifications checkbox toggle.
  const onNotificationToggle = async (
    checked: boolean,
    task: SubscriptionTask
  ) => {
    if (task.account) {
      task.enableOsNotifications = checked;
      await window.myAPI.sendSubscriptionTask({
        action: 'subscriptions:account:update',
        data: {
          serAccount: JSON.stringify(task.account!),
          serTask: JSON.stringify(task),
        },
      });
      // Update react state for tasks.
      SubscriptionsController.updateTaskState(task);

      // Update cached task in account's query multi wrapper.
      const account = AccountsController.get(
        task.chainId,
        task.account.address
      );
      if (account) {
        account.queryMulti?.setOsNotificationsFlag(task);
      }
    }
  };

  /// Handle a one-shot click.
  const onOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);
    task.enableOsNotifications = nativeChecked;
    const success = await Core.executeOneShot(task);

    if (!success) {
      setOneShotProcessing(false);
      renderToast('API timed out.', 'toast-connection', 'error', 'top-right');
    } else {
      // Wait some time to avoid the spinner snapping.
      setTimeout(() => {
        setOneShotProcessing(false);
      }, 550);

      // Analytics.
      const { action, category } = task;
      umamiEvent && umamiEvent('oneshot-account', { action, category });
    }
  };

  /// Get subscription count for address.
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

  /// Get total subscription count.
  const getTotalSubscriptionCount = (): number => {
    let count = 0;
    for (const flattened of getAllAccounts()) {
      count += getSubscriptionCountForAccount(flattened);
    }
    return count;
  };

  return (
    <SubscriptionsContext
      value={{
        chainSubscriptions: chainSubscriptionsState,
        accountSubscriptions: accountSubscriptionsState,
        chainHasSubscriptions,
        getChainSubscriptions,
        getAccountSubscriptions,
        updateAccountNameInTasks,
        handleQueuedToggle,
        onOneShot,
        onNotificationToggle,
        toggleCategoryTasks,
        getTaskType,
        getTotalSubscriptionCount,
        getSubscriptionCountForAccount,
      }}
    >
      {children}
    </SubscriptionsContext>
  );
};
