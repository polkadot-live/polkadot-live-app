import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { SubscriptionsContextInterface } from './types';
import type { SubscriptionTask } from '@/types/subscriptions';
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
  // Store received chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  // Store received account subscriptions (key is account address).
  const [accountSubscriptionsState, setAccountSubscriptionsState] = useState<
    Map<string, SubscriptionTask[]>
  >(new Map());

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
    setAccountSubscriptionsState(subscriptions);
  };

  // Get subscription tasks for a specific account.
  const getAccountSubscriptions = (address: string) => {
    const subscriptions = accountSubscriptionsState.get(address);
    return subscriptions ? subscriptions : [];
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
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};
