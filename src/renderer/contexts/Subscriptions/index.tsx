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
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { useChains } from '../Chains';
import { APIsController } from '@/controller/renderer/APIsController';

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

  /// Execute queued subscription task.
  const handleQueuedToggle = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction
  ) => {
    const p = async () => await toggleSubscription(cached, setNativeChecked);
    await TaskQueue.add(p);
  };

  /// Handle subscription task toggle.
  const toggleSubscription = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction
  ) => {
    // Invert the task status.
    const newWrapped: WrappedSubscriptionTasks = {
      ...cached,
      tasks: [
        {
          ...cached.tasks[0],
          status: cached.tasks[0].status === 'enable' ? 'disable' : 'enable',
          enableOsNotifications: false,
        },
      ],
    };

    // Send task and its associated data to backend.
    switch (newWrapped.type) {
      case 'chain': {
        // Subscribe to and persist task.
        await SubscriptionsController.subscribeChainTask(newWrapped.tasks[0]);
        await window.myAPI.updatePersistedChainTask(newWrapped.tasks[0]);

        // Update react state.
        updateTask('chain', newWrapped.tasks[0]);
        break;
      }
      case 'account': {
        // Fetch account task belongs to.
        const account = AccountsController.get(
          newWrapped.tasks[0].chainId,
          newWrapped.tasks[0].account?.address
        );

        if (!account) {
          break;
        }

        // Subscribe to and persist the task.
        await SubscriptionsController.subscribeAccountTask(
          newWrapped.tasks[0],
          account
        );

        // Render checbox correctly.
        setNativeChecked(false);

        await window.myAPI.updatePersistedAccountTask(
          JSON.stringify(newWrapped.tasks[0]),
          JSON.stringify(account.flatten())
        );

        // Update react state.
        updateTask(
          'account',
          newWrapped.tasks[0],
          newWrapped.tasks[0].account?.address
        );

        break;
      }
      default: {
        return;
      }
    }

    // Disconnect from API instance if there are no tasks that require it.
    await ApiUtils.checkAndHandleApiDisconnect(newWrapped.tasks[0]);

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
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};
