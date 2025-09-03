// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IntervalSubscriptionsContextInterface } from './types';

export const IntervalSubscriptionsContext = createContext<
  IntervalSubscriptionsContextInterface | undefined
>(undefined);

export const useIntervalSubscriptions = createSafeContextHook(
  IntervalSubscriptionsContext,
  'IntervalSubscriptionsContext'
);

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

  /// Determine if there are active subscriptions for a network.
  const chainHasIntervalSubscriptions = (chainId: ChainID) => {
    for (const task of subscriptions.get(chainId) || []) {
      if (task.status === 'enable') {
        return true;
      }
    }
    return false;
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

  /// Update an interval subscription.
  const updateIntervalSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { action, chainId, referendumId } = task;
      const cloned = new Map(prev);

      const updated = cloned
        .get(chainId)!
        .map((t) =>
          t.action === action && t.referendumId === referendumId ? task : t
        );

      cloned.set(chainId, updated);
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

  /// Get sorted keys to render chain IDs in a certain order.
  const getSortedKeys = () => {
    const order: ChainID[] = ['Polkadot Relay', 'Kusama Relay'];
    const result: ChainID[] = [];

    for (const chainId of order) {
      subscriptions.has(chainId) && result.push(chainId);
    }

    return result;
  };

  /// Get total interval subscription count.
  const getTotalIntervalSubscriptionCount = (): number =>
    [...subscriptions.values()].reduce(
      (acc, tasks) =>
        acc + tasks.filter((task) => task.status === 'enable').length,
      0
    );

  return (
    <IntervalSubscriptionsContext
      value={{
        subscriptions,
        addIntervalSubscription,
        chainHasIntervalSubscriptions,
        getIntervalSubscriptionsForChain,
        getSortedKeys,
        getTotalIntervalSubscriptionCount,
        removeIntervalSubscription,
        setSubscriptions,
        updateIntervalSubscription,
      }}
    >
      {children}
    </IntervalSubscriptionsContext>
  );
};
