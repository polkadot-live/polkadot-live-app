// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { useChainEvents } from '../ChainEvents';
import { getIntervalSubscriptionsAdapter } from './adapters';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IntervalSubscriptionsContextInterface } from '../../../types/main';

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
  const adapter = getIntervalSubscriptionsAdapter();
  const { activeRefChain } = useChainEvents();

  // Active interval subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  const getCategorised = (): Map<
    number /* refId */,
    IntervalSubscription[]
  > => {
    const map = new Map<number, IntervalSubscription[]>();
    if (!activeRefChain) {
      return map;
    }
    const subs = subscriptions.get(activeRefChain);
    if (!subs) {
      return map;
    }
    const cmp = (a: IntervalSubscription, b: IntervalSubscription) =>
      a.chainId === b.chainId &&
      a.referendumId === b.referendumId &&
      a.action === b.action;

    for (const sub of subs) {
      const { referendumId: refId } = sub;
      if (refId) {
        const cur = (map.get(refId) ?? []).filter((s) => !cmp(s, sub));
        map.set(refId, [...cur, sub]);
      }
    }
    return map;
  };

  // Add an interval subscription to the context state.
  const addIntervalSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { chainId, action, referendumId: refId } = task;
      const next = new Map(prev);
      const updated = (next.get(chainId) ?? []).filter(
        (t) =>
          !(
            t.chainId === chainId &&
            t.action === action &&
            t.referendumId === refId
          )
      );
      next.set(chainId, [...updated, task]);
      return next;
    });
  };

  // Determine if there are active subscriptions for a network.
  const chainHasIntervalSubscriptions = (chainId: ChainID) => {
    for (const task of subscriptions.get(chainId) || []) {
      if (task.status === 'enable') {
        return true;
      }
    }
    return false;
  };

  // Remove an interval subscription from the context state.
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

  // Update an interval subscription.
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

  // Get interval subscriptions for a specific chain.
  const getIntervalSubscriptionsForChain = (chainId: ChainID) => {
    const tasks = subscriptions.get(chainId);
    if (!tasks) {
      throw new Error(`No interval subscription state for ${chainId}`);
    }
    return tasks;
  };

  // Get sorted keys to render chain IDs in a certain order.
  const getSortedKeys = () => {
    const order: ChainID[] = ['Polkadot Asset Hub', 'Kusama Asset Hub'];
    const result: ChainID[] = [];
    for (const chainId of order) {
      subscriptions.has(chainId) && result.push(chainId);
    }
    return result;
  };

  // Get total interval subscription count.
  const getTotalIntervalSubscriptionCount = (): number =>
    [...subscriptions.values()].reduce(
      (acc, tasks) =>
        acc + tasks.filter((task) => task.status === 'enable').length,
      0
    );

  // Get subscriptions from database and set state on mount.
  useEffect(() => {
    adapter.onMount(addIntervalSubscription);
  }, []);

  // Listen for state syncing messages.
  useEffect(() => {
    const removeListener = adapter.listenOnMount(setSubscriptions);
    return () => {
      removeListener && removeListener();
    };
  }, []);

  // Update interval subscription state on mount and chain change.
  useEffect(() => {
    const fetch = async () => {
      const tasks = await adapter.getIntervalSubs();
      tasks.forEach((t) => addIntervalSubscription(t));
    };
    fetch();
  }, [activeRefChain]);

  return (
    <IntervalSubscriptionsContext
      value={{
        subscriptions,
        addIntervalSubscription,
        chainHasIntervalSubscriptions,
        getCategorised,
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
