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
  // Store the received state of chain subscriptions.
  const [chainSubscriptionsState, setChainSubscriptionsState] = useState<
    Map<ChainID, SubscriptionTask[]>
  >(new Map());

  const setChainSubscriptions = (
    subscriptions: Map<ChainID, SubscriptionTask[]>
  ) => {
    console.log(subscriptions);

    setChainSubscriptionsState(subscriptions);
  };

  const getChainSubscriptions = (chainId: ChainID) => {
    const subscriptions = chainSubscriptionsState.get(chainId);
    return subscriptions ? subscriptions : [];
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        chainSubscriptions: chainSubscriptionsState,
        setChainSubscriptions,
        getChainSubscriptions,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};
