// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { useAddresses } from '../Addresses';
import { createSafeContextHook, renderToast } from '../../../utils';
import { useManage } from '../Manage';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type { ReactNode } from 'react';
import type { SubscriptionsContextInterface } from '../../../types/main';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';
import { getSubscriptionsAdapter } from './adapters';

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
  const adapter = getSubscriptionsAdapter();
  const { getAllAccounts } = useAddresses();
  const { renderedSubscriptions, setRenderedSubscriptions } = useManage();

  // Store chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  // Store account subscriptions (key is {chainId}:{address}).
  const [accountSubscriptionsState, setAccountSubscriptionsState] = useState<
    Map<string, SubscriptionTask[]>
  >(new Map());

  const [activeChainMap, setActiveChainMap] = useState<Map<ChainID, number>>(
    new Map()
  );

  // Determine if there are active subscriptions for a network.
  const chainHasSubscriptions = (chainId: ChainID) =>
    Boolean(activeChainMap.get(chainId)) || false;

  // Update cached account name for an account's subscription tasks.
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

  // Get subscription tasks for a specific chain.
  const getChainSubscriptions = (chainId: ChainID) =>
    chainSubscriptionsState.get(chainId) || [];

  // Get subscription tasks for a specific account.
  const getAccountSubscriptions = (key: string) =>
    accountSubscriptionsState.get(key) || [];

  // Return the type of subscription based on its action string.
  const getTaskType = (task: SubscriptionTask): SubscriptionTaskType =>
    task.action.startsWith('subscribe:account') ? 'account' : 'chain';

  // Handle toggling on all subscriptions in a category.
  const toggleCategoryTasks = async (category: TaskCategory, isOn: boolean) => {
    await adapter.onToggleCategoryTasks(
      category,
      isOn,
      renderedSubscriptions,
      getTaskType,
      setRenderedSubscriptions
    );
  };

  // Execute queued subscription task.
  const handleQueuedToggle = async (task: SubscriptionTask) => {
    await adapter.handleQueuedToggle(
      task,
      getTaskType(task),
      renderedSubscriptions,
      setRenderedSubscriptions
    );
  };

  // Handle task update on notification checkbox click.
  const onNotificationToggle = async (
    checked: boolean,
    task: SubscriptionTask
  ) => {
    adapter.toggleTaskNotifications(task, checked);
  };

  // Handle a one-shot click.
  const onOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);
    task.enableOsNotifications = nativeChecked;
    const success = await adapter.executeOneShot(task);
    if (!success) {
      setOneShotProcessing(false);
      renderToast('API timed out.', 'toast-connection', 'error', 'top-right');
    } else {
      setTimeout(() => {
        setOneShotProcessing(false);
      }, 550);
    }
  };

  // Get subscription count for address.
  const getSubscriptionCountForAccount = (
    flattened: FlattenedAccountData
  ): number => {
    const { chain: chainId, address } = flattened;
    const tasks = accountSubscriptionsState.get(`${chainId}:${address}`) || [];
    return tasks.reduce((acc, t) => (t.status === 'enable' ? acc + 1 : acc), 0);
  };

  // Get total subscription count.
  const getTotalSubscriptionCount = (): number =>
    adapter.getTotalSubscriptionCount(activeChainMap, getAllAccounts);

  // Fetch and set chain subscription state on component mount.
  useEffect(() => {
    adapter.onMount(setAccountSubscriptionsState, setChainSubscriptionsState);
  }, []);

  // Listen for chain subscription state messages.
  useEffect(() => {
    const removeListener = adapter.listenOnMount(
      setAccountSubscriptionsState,
      setChainSubscriptionsState,
      updateAccountNameInTasks,
      setActiveChainMap
    );
    return () => {
      removeListener && removeListener();
    };
  }, []);

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
