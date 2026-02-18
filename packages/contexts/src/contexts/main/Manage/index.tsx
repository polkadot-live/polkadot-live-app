// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { useChainEvents } from '../ChainEvents';
import { getManageAdapter } from './adapters';
import type {
  SubscriptionTask,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';
import type { ReactNode } from 'react';
import type { ManageContextInterface } from '../../../types/main';

export const ManageContext = createContext<ManageContextInterface | undefined>(
  undefined,
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
    type T = TaskCategory;
    const ordered: T[] = [
      'Balances',
      'Chain',
      ...(activeAccount?.nominatingData ? ['Nominating' as T] : []),
      ...(activeAccount?.nominationPoolData ? ['Nomination Pools' as T] : []),
    ];

    const map = new Map(ordered.map((c) => [c, [] as SubscriptionTask[]]));
    renderedSubscriptionsState.tasks.forEach((task) => {
      map.get(task.category)?.push(task);
    });

    return new Map([...map].filter(([, tasks]) => tasks.length));
  };

  // Listen for state messages.
  useEffect(() => {
    const removeListener = adapter.onMount(setRenderedSubscriptionsState);
    return () => {
      removeListener?.();
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
