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

  const [intervalTasksState, setIntervalTasksState] = useState<
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
  const setIntervalTasks = (tasks: IntervalSubscription[]) => {
    setIntervalTasksState([...tasks]);
  };

  /// Update a task in the interval subscriptions state.
  const updateIntervalTask = (task: IntervalSubscription) => {
    setIntervalTasksState((prev) =>
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
      setIntervalTasksState((prev) => [...prev, { ...task }]);
    }
  };

  /// Remove an interval task from state if it should be removed.
  const tryRemoveIntervalSubscription = (
    action: string,
    referendumId: number
  ) => {
    setIntervalTasksState((prev) =>
      prev.filter(
        (t) => !(t.action === action && t.referendumId === referendumId)
      )
    );
  };

  return (
    <ManageContext.Provider
      value={{
        renderedSubscriptions: renderedSubscriptionsState,
        intervalTasksState,
        setIntervalTasks,
        setRenderedSubscriptions,
        updateRenderedSubscriptions,
        updateIntervalTask,
        tryAddIntervalSubscription,
        tryRemoveIntervalSubscription,
        activeChainId,
        setActiveChainId,
      }}
    >
      {children}
    </ManageContext.Provider>
  );
};
