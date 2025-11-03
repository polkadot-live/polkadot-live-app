// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState, createContext, useRef, useEffect } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import type { ReactNode } from 'react';
import type {
  IntervalSubscription,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';
import { SubscriptionsController } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ManageContextInterface } from '@polkadot-live/contexts/types/main';

export const ManageContext = createContext<ManageContextInterface | undefined>(
  undefined
);

export const useManage = createSafeContextHook(ManageContext, 'ManageContext');

export const ManageProvider = ({ children }: { children: ReactNode }) => {
  /// Subscription tasks being rendered under the Manage tab.
  const [renderedSubscriptionsState, setRenderedSubscriptionsState] =
    useState<WrappedSubscriptionTasks>({ type: '', tasks: [] });

  const [dynamicIntervalTasksState, setDynamicIntervalTasksState] = useState<
    IntervalSubscription[]
  >([]);

  /// Active ChainID for OpenGov subscriptions list.
  const [activeChainId, setActiveChainId] = useState<ChainID | null>(null);
  const activeChainRef = useRef<ChainID | null>(null);

  /// Set rendered subscriptions.
  const setRenderedSubscriptions = (wrapped: WrappedSubscriptionTasks) => {
    setRenderedSubscriptionsState({ ...wrapped });
  };

  /// Set intervaled subscriptions with new tasks array.
  const setDynamicIntervalTasks = (
    tasks: IntervalSubscription[],
    chainId: ChainID
  ) => {
    activeChainRef.current = chainId;
    setActiveChainId(chainId);
    setDynamicIntervalTasksState([...tasks]);
  };

  /// Update a task in the interval subscriptions state.
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

  /// Add an interval task to state if it should be rendered.
  const tryAddIntervalSubscription = (task: IntervalSubscription) => {
    if (activeChainRef.current === task.chainId) {
      setDynamicIntervalTasksState((prev) => [...prev, { ...task }]);
    }
  };

  /// Remove an interval task from state if it should be removed.
  const tryRemoveIntervalSubscription = (task: IntervalSubscription) => {
    if (activeChainRef.current === task.chainId) {
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

  /// Get dynamic interval subscriptions categorized by referendum ID.
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

  useEffect(() => {
    SubscriptionsController.setRenderedSubscriptionsState =
      setRenderedSubscriptionsState;
  }, []);

  return (
    <ManageContext
      value={{
        activeChainId,
        dynamicIntervalTasksState,
        renderedSubscriptions: renderedSubscriptionsState,
        setDynamicIntervalTasks,
        setRenderedSubscriptions,
        tryUpdateDynamicIntervalTask,
        tryAddIntervalSubscription,
        tryRemoveIntervalSubscription,
        setActiveChainId,
        getCategorisedDynamicIntervals,
      }}
    >
      {children}
    </ManageContext>
  );
};
