// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { ManageContextInterface } from './types';

// Hook to manage context.
export const useManage = () => useContext(ManageContext);

// Manage context.
export const ManageContext = createContext<ManageContextInterface>(
  defaults.defaultManageContext
);

// Manage context provider.
export const ManageProvider = ({ children }: { children: ReactNode }) => {
  /// Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });

  const [dynamicIntervalTasksState, setDynamicIntervalTasksState] = useState<
    IntervalSubscription[]
  >([]);

  const [activeChainId, setActiveChainId] = useState<ChainID>('Polkadot');

  /// Set rendered subscriptions.
  const setRenderedSubscriptions = (wrapped: WrappedSubscriptionTasks) => {
    setRenderedSubscriptionsState({ ...wrapped });
  };

  /// Update a task in the the rendered subscription tasks state.
  const updateRenderedSubscriptions = (task: SubscriptionTask) => {
    setRenderedSubscriptionsState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.action === task.action ? task : t)),
    }));
  };

  /// Set intervaled subscriptions with new tasks array.
  const setDynamicIntervalTasks = (tasks: IntervalSubscription[]) => {
    setDynamicIntervalTasksState([...tasks]);
  };

  /// Update a task in the interval subscriptions state.
  const updateDynamicIntervalTask = (task: IntervalSubscription) => {
    setDynamicIntervalTasksState((prev) =>
      prev.map((t) =>
        t.action === task.action && t.referendumId === task.referendumId
          ? task
          : t
      )
    );
  };

  /// Add an interval task to state if it should be rendered.
  const tryAddIntervalSubscription = (task: IntervalSubscription) => {
    if (activeChainId === task.chainId) {
      setDynamicIntervalTasksState((prev) => [...prev, { ...task }]);
    }
  };

  /// Remove an interval task from state if it should be removed.
  const tryRemoveIntervalSubscription = (
    action: string,
    referendumId: number
  ) => {
    setDynamicIntervalTasksState((prev) =>
      prev.filter(
        (t) => !(t.action === action && t.referendumId === referendumId)
      )
    );
  };

  /// Get dynamic interval subscriptions categorized by referendum ID.
  const getCategorizedDynamicIntervals = (): Map<
    number,
    IntervalSubscription[]
  > => {
    const map = new Map<number, IntervalSubscription[]>();

    // Construct an array of sorted referendum IDs.
    const referendumIds = new Set(
      dynamicIntervalTasksState
        .map(({ referendumId }) => referendumId || -1)
        .sort()
        .reverse()
    );

    // Insert IDs as map keys in order.
    for (const rid of referendumIds) {
      map.set(rid, []);
    }

    // Insert subscriptions into map.
    for (const task of dynamicIntervalTasksState) {
      if (!task.referendumId) {
        continue;
      }

      const { referendumId: rid } = task;
      map.has(rid)
        ? map.set(rid, [...map.get(rid)!, { ...task }])
        : map.set(rid, [{ ...task }]);
    }

    // Remove any empty keys in the map.
    for (const [rid, tasks] of map.entries()) {
      tasks.length === 0 && map.delete(rid);
    }

    return map;
  };

  return (
    <ManageContext.Provider
      value={{
        renderedSubscriptions: renderedSubscriptionsState,
        dynamicIntervalTasksState,
        setDynamicIntervalTasks,
        setRenderedSubscriptions,
        updateRenderedSubscriptions,
        updateDynamicIntervalTask,
        tryAddIntervalSubscription,
        tryRemoveIntervalSubscription,
        activeChainId,
        setActiveChainId,
        getCategorizedDynamicIntervals,
      }}
    >
      {children}
    </ManageContext.Provider>
  );
};
