import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { SubscriptionsContextInterface } from './types';
import type {
  WrappedSubscriptionTasks,
  SubscriptionTask,
} from '@/types/subscriptions';
import type { ChainID } from '@/types/chains';
import * as defaults from './defaults';

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
  /*------------------------------------------------------------ 
   State
   ------------------------------------------------------------*/

  // Store received chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  // Store received account subscriptions (key is account address).
  const [accountSubscriptionsState, setAccountSubscriptionsState] = useState<
    Map<string, SubscriptionTask[]>
  >(new Map());

  // Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });

  /*------------------------------------------------------------ 
   Functions
   ------------------------------------------------------------*/

  // Set chain subscription tasks.
  const setChainSubscriptions = (
    subscriptions: Map<ChainID, SubscriptionTask[]>
  ) => {
    setChainSubscriptionsState(subscriptions);
  };

  // Get subscription tasks for a specific chain.
  const getChainSubscriptions = (chainId: ChainID) => {
    const subscriptions = chainSubscriptionsState.get(chainId);
    return subscriptions ? subscriptions : [];
  };

  // Set subscription tasks for all accounts.
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

  // Get subscription tasks for a specific account.
  const getAccountSubscriptions = (address: string) => {
    const subscriptions = accountSubscriptionsState.get(address);
    return subscriptions ? subscriptions : [];
  };

  // Update a task in the the rendered subscription tasks.
  const updateRenderedSubscriptions = (task: SubscriptionTask) => {
    setRenderedSubscriptionsState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.action === task.action ? task : t)),
    }));
  };

  // Set rendered subscriptions.
  const setRenderedSubscriptions = (wrapped: WrappedSubscriptionTasks) => {
    setRenderedSubscriptionsState({ ...wrapped });
  };

  // Update state of a task.
  // TODO: Remove `!` non-null assertions.
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

  /*------------------------------------------------------------ 
   Provider
   ------------------------------------------------------------*/

  return (
    <SubscriptionsContext.Provider
      value={{
        chainSubscriptions: chainSubscriptionsState,
        accountSubscriptions: accountSubscriptionsState,
        renderedSubscriptions: renderedSubscriptionsState,
        setRenderedSubscriptions,
        updateRenderedSubscriptions,
        setChainSubscriptions,
        getChainSubscriptions,
        setAccountSubscriptions,
        getAccountSubscriptions,
        updateTask,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};
