// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';

// Context interface.
interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  intervalTasksState: IntervalSubscription[];
  setIntervalTasks: (tasks: IntervalSubscription[]) => void;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
  updateRenderedSubscriptions: (a: SubscriptionTask) => void;
  updateIntervalTask: (task: IntervalSubscription) => void;
}

// Default context value.
const defaultManageContext: ManageContextInterface = {
  renderedSubscriptions: { type: '', tasks: [] },
  intervalTasksState: [],
  setIntervalTasks: () => {
    // do nothing
  },
  setRenderedSubscriptions: () => {
    // do nothing
  },
  updateRenderedSubscriptions: () => {
    // do nothing
  },
  updateIntervalTask: () => {
    // do nothing
  },
};

// Hook to manage context.
export const useManage = () => useContext(ManageContext);

// Manage context.
export const ManageContext =
  createContext<ManageContextInterface>(defaultManageContext);

// Manage context provider.
export const ManageProvider = ({ children }: { children: ReactNode }) => {
  /// Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });

  const [intervalTasksState, setIntervalTasksState] = useState<
    IntervalSubscription[]
  >([]);

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

  return (
    <ManageContext.Provider
      value={{
        renderedSubscriptions: renderedSubscriptionsState,
        intervalTasksState,
        setIntervalTasks,
        setRenderedSubscriptions,
        updateRenderedSubscriptions,
        updateIntervalTask,
      }}
    >
      {children}
    </ManageContext.Provider>
  );
};
