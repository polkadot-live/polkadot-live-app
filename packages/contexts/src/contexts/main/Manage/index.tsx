// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState, createContext, useEffect } from 'react';
import { useChainEvents } from '../ChainEvents';
import { createSafeContextHook } from '../../../utils';
import { getManageAdapter } from './adapters';
import type {
  SubscriptionTask,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';
import type { ManageContextInterface } from '../../../types/main';
import type { ReactNode } from 'react';

export const ManageContext = createContext<ManageContextInterface | undefined>(
  undefined
);

export const useManage = createSafeContextHook(ManageContext, 'ManageContext');

export const ManageProvider = ({ children }: { children: ReactNode }) => {
  const { activeAccount } = useChainEvents();
  const adapter = getManageAdapter();

  // Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });

  // Set rendered subscriptions.
  const setRenderedSubscriptions = (wrapped: WrappedSubscriptionTasks) => {
    setRenderedSubscriptionsState({ ...wrapped });
  };

  // Return subscription tasks mapped by category.
  const getCategorised = (): Map<TaskCategory, SubscriptionTask[]> => {
    const ordered: TaskCategory[] = ['Balances', 'Chain'];
    if (activeAccount) {
      activeAccount.nominatingData && ordered.push('Nominating');
      activeAccount.nominationPoolData && ordered.push('Nomination Pools');
    }
    const { tasks } = renderedSubscriptionsState;
    const map = new Map<TaskCategory, SubscriptionTask[]>();
    for (const category of ordered) {
      map.set(category, []);
    }
    for (const task of tasks) {
      const { category } = task;
      if (!ordered.includes(task.category)) {
        continue;
      }
      const cur = map.get(category) ?? [];
      map.set(category, [...cur, task]);
    }
    for (const [key, val] of map.entries()) {
      if (!val.length) {
        map.delete(key);
      }
    }
    return map;
  };

  // Listen for state messages.
  useEffect(() => {
    const removeListener = adapter.onMount(setRenderedSubscriptionsState);
    return () => {
      removeListener && removeListener();
    };
  }, []);

  return (
    <ManageContext
      value={{
        renderedSubscriptions: renderedSubscriptionsState,
        getCategorised,
        setRenderedSubscriptions,
      }}
    >
      {children}
    </ManageContext>
  );
};
