// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { renderToast } from '@polkadot-live/ui/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReactNode } from 'react';
import type { SubscriptionsContextInterface } from '@polkadot-live/contexts/types/main';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  TaskCategory,
  WrappedSubscriptionTasks,
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
  // Store chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  // Store account subscriptions (key is {chainId}:{address}).
  const [accountSubscriptionsState, setAccountSubscriptionsState] = useState<
    Map<string, SubscriptionTask[]>
  >(new Map());

  const [activeChainMap, setActiveChainMap] = useState<Map<ChainID, boolean>>(
    new Map()
  );

  // Determine if there are active subscriptions for a network.
  const chainHasSubscriptions = (chainId: ChainID) =>
    activeChainMap.get(chainId) || false;

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
  const toggleCategoryTasks = async (
    category: TaskCategory,
    isOn: boolean,
    rendererdSubscriptions: WrappedSubscriptionTasks
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
  };

  // Execute queued subscription task.
  const handleQueuedToggle = async (task: SubscriptionTask) => {
    await toggleSubscription(task);
  };

  // Handle subscription task toggle.
  const toggleSubscription = async (task: SubscriptionTask) => {
    // Invert the task status.
    const newStatus = task.status === 'enable' ? 'disable' : 'enable';
    task.status = newStatus;
    task.enableOsNotifications = newStatus === 'enable' ? true : false;

    // Send task and its associated data to backend.
    switch (getTaskType(task)) {
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
  };

  // Handle task update on notification checkbox click.
  const onNotificationToggle = async (
    checked: boolean,
    task: SubscriptionTask
  ) => {
    if (task.account) {
      task.enableOsNotifications = checked;
      await chrome.runtime.sendMessage({
        type: 'accountSubscriptions',
        task: 'notificationToggle',
        payload: { task },
      });
    }
  };

  // Handle a one-shot click.
  const onOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);
    task.enableOsNotifications = nativeChecked;

    const success = (await chrome.runtime.sendMessage({
      type: 'oneShot',
      task: 'execute',
      payload: { task },
    })) as boolean;

    if (!success) {
      setOneShotProcessing(false);
      renderToast('API timed out.', 'toast-connection', 'error', 'top-right');
    } else {
      setTimeout(() => {
        setOneShotProcessing(false);
      }, 550);
    }
  };

  useEffect(() => {
    // Listen for chain subscription state messages.
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
            setActiveChainMap(parseMap<ChainID, boolean>(activeChains));
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
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
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
      }}
    >
      {children}
    </SubscriptionsContext>
  );
};
