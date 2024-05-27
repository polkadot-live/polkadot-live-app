// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { ReferendaSubscriptionsContextInterface } from './types';
import type { ActiveReferendaInfo } from '@/types/openGov';

export const ReferendaSubscriptionsContext =
  createContext<ReferendaSubscriptionsContextInterface>(
    defaults.defaultReferendaSubscriptionsContext
  );

export const useReferendaSubscriptions = () =>
  useContext(ReferendaSubscriptionsContext);

export const ReferendaSubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Cached referenda subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  /// Map to identify active subscriptions for individual referenda.
  /// Key is referendum ID, value is array of subscription tasks.
  const [activeTasksMap, setActiveTasksMap] = useState<Map<number, string[]>>(
    new Map()
  );

  /// Add a task to the context.
  const addReferendaSubscription = (task: IntervalSubscription) => {
    // Update subscriptions map.
    setSubscriptions((prev) => {
      const { chainId } = { ...task };
      const cloned = new Map(prev);

      cloned.has(chainId)
        ? cloned.set(chainId, [...cloned.get(chainId)!, { ...task }])
        : cloned.set(chainId, [{ ...task }]);

      return cloned;
    });

    // Update active tasks map.
    setActiveTasksMap((prev) => {
      const { referendumId, action } = { ...task };
      const key = referendumId!;
      const cloned = new Map(prev);

      cloned.has(key)
        ? cloned.set(key, [...cloned.get(key)!, action])
        : cloned.set(key, [action] as string[]);

      return cloned;
    });
  };

  /// Remove a task from the context.
  const removeReferendaSubscription = (
    task: IntervalSubscription,
    referendumId: number
  ) => {
    console.log(
      `Remove task ${task.action} for referendum with ID ${referendumId}`
    );

    // Update subscriptions map.
    setSubscriptions((prev) => {
      const { chainId, action, referendumId: refId } = { ...task };
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
                  (t) => !(t.action === action && t.referendumId === refId)
                )
            );
      }

      return cloned;
    });

    // Update active tasks map.
    setActiveTasksMap((prev) => {
      const { action } = { ...task };
      const key = referendumId;
      const cloned = new Map(prev);

      if (cloned.has(key)) {
        const cached = cloned.get(key)!;

        cached.length === 1
          ? cloned.delete(key)
          : cloned.set(
              key,
              cached.filter((a) => a !== action)
            );
      }

      return cloned;
    });
  };

  /// Check if a referendum is subscribed to the provided action.
  const isSubscribedToTask = (
    referendum: ActiveReferendaInfo,
    task: IntervalSubscription
  ) => {
    const { referendaId } = referendum;
    const { action } = task;

    if (activeTasksMap.has(referendaId)) {
      const items = activeTasksMap.get(referendaId)!;
      if (items.includes(action)) {
        return true;
      }
    }

    return false;
  };

  return (
    <ReferendaSubscriptionsContext.Provider
      value={{
        subscriptions,
        setSubscriptions,
        activeTasksMap,
        setActiveTasksMap,
        addReferendaSubscription,
        removeReferendaSubscription,
        isSubscribedToTask,
      }}
    >
      {children}
    </ReferendaSubscriptionsContext.Provider>
  );
};
