// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { IntervalSubscriptionsContextInterface } from './types';

export const IntervalSubscriptionsContext =
  createContext<IntervalSubscriptionsContextInterface>(
    defaults.defaultIntervalSubscriptionsContext
  );

export const useIntervalSubscriptions = () =>
  useContext(IntervalSubscriptionsContext);

export const IntervalSubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Active interval subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  /// Add an interval subscription to the context state.
  const addIntervalSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { chainId } = task;
      const cloned = new Map(prev);

      cloned.has(chainId)
        ? cloned.set(chainId, [...cloned.get(chainId)!, { ...task }])
        : cloned.set(chainId, [{ ...task }]);

      return cloned;
    });
  };

  /// Remove an interval subscription from the context state.
  const removeIntervalSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      // NOTE: Relies on referendum ID to filter task for now.
      const { chainId, action, referendumId } = task;
      const cloned = new Map(prev);

      const updated = cloned
        .get(chainId)!
        .filter(
          (t) => !(t.action === action && t.referendumId === referendumId)
        );

      updated.length ? cloned.set(chainId, updated) : cloned.delete(chainId);
      return cloned;
    });
  };

  /// Get interval subscriptions for a specific chain.
  const getIntervalSubscriptionsForChain = (chainId: ChainID) => {
    const tasks = subscriptions.get(chainId);

    if (!tasks) {
      throw new Error(`No interval subscription state for ${chainId}`);
    }

    return tasks;
  };

  return (
    <IntervalSubscriptionsContext.Provider
      value={{
        subscriptions,
        setSubscriptions,
        addIntervalSubscription,
        removeIntervalSubscription,
        getIntervalSubscriptionsForChain,
      }}
    >
      {children}
    </IntervalSubscriptionsContext.Provider>
  );
};
