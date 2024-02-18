// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

// Context interface.
interface ManageContextInterface {
  renderedSubscriptions: WrappedSubscriptionTasks;
  setRenderedSubscriptions: (a: WrappedSubscriptionTasks) => void;
  updateRenderedSubscriptions: (a: SubscriptionTask) => void;
}

// Default context value.
const defaultManageContext: ManageContextInterface = {
  renderedSubscriptions: { type: '', tasks: [] },
  setRenderedSubscriptions: () => {
    // do nothing
  },
  updateRenderedSubscriptions: () => {
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
  // Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });

  // Set rendered subscriptions.
  const setRenderedSubscriptions = (wrapped: WrappedSubscriptionTasks) => {
    setRenderedSubscriptionsState({ ...wrapped });
  };

  // Update a task in the the rendered subscription tasks state.
  const updateRenderedSubscriptions = (task: SubscriptionTask) => {
    setRenderedSubscriptionsState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.action === task.action ? task : t)),
    }));
  };

  return (
    <ManageContext.Provider
      value={{
        renderedSubscriptions: renderedSubscriptionsState,
        setRenderedSubscriptions,
        updateRenderedSubscriptions,
      }}
    >
      {children}
    </ManageContext.Provider>
  );
};
