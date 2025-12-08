// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState, createContext, useEffect } from 'react';
import { useChainEvents } from '../ChainEvents';
import { createSafeContextHook } from '../../../utils';
import { getManageAdapter } from './adapters';
import type {
  IntervalSubscription,
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
  const { activeAccount, activeRefChain } = useChainEvents();
  const adapter = getManageAdapter();

  // Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });
  const [dynamicIntervalTasksState, setDynamicIntervalTasksState] = useState<
    IntervalSubscription[]
  >([]);

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

  // Set intervaled subscriptions with new tasks array.
  const setDynamicIntervalTasks = (tasks: IntervalSubscription[]) => {
    setDynamicIntervalTasksState([...tasks]);
  };

  // Update a task in the interval subscriptions state.
  const tryUpdateDynamicIntervalTask = (task: IntervalSubscription) => {
    setDynamicIntervalTasksState((prev) =>
      prev.map((t) =>
        t.action === task.action &&
        t.referendumId === task.referendumId &&
        t.chainId === task.chainId
          ? task
          : t
      )
    );
  };

  // Add an interval task to state if it should be rendered.
  const tryAddIntervalSubscription = (task: IntervalSubscription) => {
    if (activeRefChain === task.chainId) {
      const { action, chainId, referendumId: refId } = task;
      setDynamicIntervalTasksState((prev) => [
        ...prev.filter(
          (t) =>
            !(
              t.action === action &&
              t.chainId === chainId &&
              t.referendumId === refId
            )
        ),
        task,
      ]);
    }
  };

  // Remove an interval task from state if it should be removed.
  const tryRemoveIntervalSubscription = (task: IntervalSubscription) => {
    if (activeRefChain === task.chainId) {
      const { action, chainId, referendumId } = task;
      setDynamicIntervalTasksState((prev) =>
        prev.filter(
          (t) =>
            !(
              t.action === action &&
              t.chainId === chainId &&
              t.referendumId === referendumId
            )
        )
      );
    }
  };

  // Get dynamic interval subscriptions categorized by referendum ID.
  const getCategorisedDynamicIntervals = (): Map<
    number,
    IntervalSubscription[]
  > => {
    const map = new Map<number, IntervalSubscription[]>();

    // Construct an array of sorted referendum IDs.
    const referendumIds = new Set(
      dynamicIntervalTasksState
        .map(({ referendumId }) => referendumId || -1)
        .sort((a, b) => a - b)
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
        ? map.set(
            rid,
            [...map.get(rid)!, { ...task }].sort((a, b) =>
              a.label.localeCompare(b.label)
            )
          )
        : map.set(rid, [{ ...task }]);
    }
    // Remove any empty keys in the map.
    for (const [rid, tasks] of map.entries()) {
      tasks.length === 0 && map.delete(rid);
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
        dynamicIntervalTasksState,
        renderedSubscriptions: renderedSubscriptionsState,
        getCategorised,
        setDynamicIntervalTasks,
        setRenderedSubscriptions,
        tryUpdateDynamicIntervalTask,
        tryAddIntervalSubscription,
        tryRemoveIntervalSubscription,
        getCategorisedDynamicIntervals,
      }}
    >
      {children}
    </ManageContext>
  );
};
