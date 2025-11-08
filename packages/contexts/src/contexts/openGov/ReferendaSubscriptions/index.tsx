// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getReferendaSubscriptionsAdapter } from './adapters';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { ReferendaSubscriptionsContextInterface } from '../../../types/openGov';
import type { ReferendaInfo, RefStatus } from '@polkadot-live/types/openGov';

export const ReferendaSubscriptionsContext = createContext<
  ReferendaSubscriptionsContextInterface | undefined
>(undefined);

export const useReferendaSubscriptions = createSafeContextHook(
  ReferendaSubscriptionsContext,
  'ReferendaSubscriptionsContext'
);

export const ReferendaSubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getReferendaSubscriptionsAdapter();

  // Cached referenda subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  // Map to identify added subscriptions for individual referenda.
  // Key is referendum ID, value is array of subscription tasks.
  type ActiveTasksForChain = Map<number, string[]>;
  type ActiveTasks = Map<ChainID, ActiveTasksForChain>;
  const [activeTasksMap, setActiveTasksMap] = useState<ActiveTasks>(new Map());

  // Add a task to the context.
  const addReferendaSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { chainId } = task;
      const cloned = new Map(prev);
      cloned.has(chainId)
        ? cloned.set(chainId, [...cloned.get(chainId)!, task])
        : cloned.set(chainId, [task]);

      return cloned;
    });

    // Update active tasks map.
    setActiveTasksMap((prev) => {
      const { chainId, referendumId, action } = task;
      const key = referendumId!;
      const cloned = new Map(prev);
      if (cloned.has(chainId)) {
        const chainItems = cloned.get(chainId)!;
        chainItems.has(key)
          ? chainItems.set(key, [...chainItems.get(key)!, action])
          : chainItems.set(key, [action] as string[]);
        cloned.set(chainId, chainItems);
      } else {
        cloned.set(chainId, new Map([[key, [action]]]));
      }
      return cloned;
    });
  };

  // Remove a task from the context.
  const removeReferendaSubscription = (task: IntervalSubscription) => {
    // Update subscriptions map.
    setSubscriptions((prev) => {
      const { chainId, action, referendumId } = task;
      const cloned = new Map(prev);
      if (cloned.has(chainId)) {
        const cached = cloned.get(chainId)!;
        cached.length === 1
          ? cloned.delete(chainId)
          : cloned.set(
              chainId,
              cloned
                .get(chainId)!
                .filter(
                  (t) =>
                    !(t.action === action && t.referendumId === referendumId)
                )
            );
      }
      return cloned;
    });

    // Update active tasks map.
    setActiveTasksMap((prev) => {
      const { chainId, action, referendumId } = task;
      const cloned = new Map(prev);
      const key = referendumId!;

      if (cloned.has(chainId)) {
        const chainItems = cloned.get(chainId)!;
        if (chainItems.has(key)) {
          const cached = chainItems.get(key)!;
          cached.length === 1
            ? chainItems.delete(key)
            : chainItems.set(
                key,
                cached.filter((a) => a !== action)
              );
          chainItems.size
            ? cloned.set(chainId, chainItems)
            : cloned.delete(chainId);
        }
      }
      return cloned;
    });
  };

  // Check if a task has been added for a referendum.
  const isSubscribedToTask = (
    referendum: ReferendaInfo,
    task: IntervalSubscription
  ) => {
    const { refId } = referendum;
    const { chainId, action } = task;
    if (activeTasksMap.has(chainId)) {
      const chainItems = activeTasksMap.get(chainId)!;
      if (chainItems.has(refId)) {
        const items = chainItems.get(refId)!;
        if (items.includes(action)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if a referendum has added subscription tasks.
  const isSubscribedToReferendum = (
    chainId: ChainID,
    referendum: ReferendaInfo
  ) =>
    activeTasksMap.has(chainId)
      ? activeTasksMap.get(chainId)!.has(referendum.refId)
      : false;

  // Check if referendum has all its subscriptions added.
  const allSubscriptionsAdded = (
    chainId: ChainID,
    referendum: ReferendaInfo
  ) => {
    if (!activeTasksMap.has(chainId)) {
      return false;
    }
    const chainItems = activeTasksMap.get(chainId)!;
    const { refId } = referendum;
    if (!chainItems.has(Number(refId))) {
      return false;
    }
    const MAX_SUBSCRIPTIONS: number = (
      ['Preparing', 'Queueing'] as RefStatus[]
    ).includes(referendum.refStatus)
      ? 1
      : 3;
    return chainItems.get(refId)!.length === MAX_SUBSCRIPTIONS ? true : false;
  };

  // Check if any subscriptions have been added for a given chain.
  const isNotSubscribedToAny = (chainId: ChainID) =>
    !activeTasksMap.has(chainId);

  // Update data of a managed task.
  const updateReferendaSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { action, chainId, referendumId: refId } = task;
      const cloned = new Map(prev);
      if (!cloned.has(chainId)) {
        cloned.set(chainId, []);
      }
      const updated = cloned
        .get(chainId)!
        .filter((t) => !(t.action === action && t.referendumId === refId))
        .concat([task]);
      cloned.set(chainId, updated);
      return cloned;
    });
  };

  // Fetch interval subscriptions from store and initialize state on mount.
  useEffect(() => {
    adapter.fetchOnMount().then((result) => {
      if (result) {
        for (const task of result) {
          addReferendaSubscription(task);
        }
      }
    });
  }, []);

  // Listen for messages from popup.
  useEffect(() => {
    const removeListener = adapter.listenOnMount(
      addReferendaSubscription,
      removeReferendaSubscription,
      updateReferendaSubscription
    );
    return () => {
      removeListener && removeListener();
    };
  }, []);

  return (
    <ReferendaSubscriptionsContext
      value={{
        subscriptions,
        setSubscriptions,
        activeTasksMap,
        addReferendaSubscription,
        removeReferendaSubscription,
        updateReferendaSubscription,
        isSubscribedToTask,
        isSubscribedToReferendum,
        isNotSubscribedToAny,
        allSubscriptionsAdded,
      }}
    >
      {children}
    </ReferendaSubscriptionsContext>
  );
};
