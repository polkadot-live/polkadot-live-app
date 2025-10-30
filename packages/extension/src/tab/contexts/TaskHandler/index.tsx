// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext } from 'react';
import { renderToast } from '@polkadot-live/ui/utils';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { useConnections } from '../../../contexts';
import { useReferendaSubscriptions } from '../ReferendaSubscriptions';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { TaskHandlerContextInterface } from '@polkadot-live/contexts/types/openGov';

export const TaskHandlerContext = createContext<
  TaskHandlerContextInterface | undefined
>(undefined);

export const useTaskHandler = createSafeContextHook(
  TaskHandlerContext,
  'TaskHandlerContext'
);

export const TaskHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const {
    addReferendaSubscription,
    removeReferendaSubscription,
    isSubscribedToTask,
  } = useReferendaSubscriptions();

  // Handles adding an interval subscription for a referendum.
  const addIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ReferendaInfo
  ) => {
    // Set referendum ID on task, enable and cache.
    const { refId: referendumId } = referendumInfo;
    task.referendumId = referendumId;
    task.status = 'enable';
    addReferendaSubscription(task);

    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'add',
      payload: { task, onlineMode: getOnlineMode() },
    });

    const text = `Subscription added for referendum ${referendumId}.`;
    const toastId = `add-${task.chainId}-${referendumId}-${task.action}`;
    renderToast(text, toastId, 'success');
  };

  // Handles removing an interval subscription for a referendum.
  const removeIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ReferendaInfo
  ) => {
    // Set referendum ID on task.
    const { refId: referendumId } = referendumInfo;
    task.referendumId = referendumId;

    // Remove from referenda subscriptions context.
    removeReferendaSubscription(task);

    // Remove from store and popup state.
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'delete',
      payload: { task },
    });

    const text = `Subscription removed for referendum ${referendumId}.`;
    const toastId = `remove-${task.chainId}-${referendumId}-${task.action}`;
    renderToast(text, toastId, 'success');
  };

  // Handles adding all available subscriptions for a referendum.
  const addAllIntervalSubscriptions = (
    tasks: IntervalSubscription[],
    referendumInfo: ReferendaInfo
  ) => {
    const { refId: referendumId } = referendumInfo;

    // Throw away task if it's already added and set required fields.
    const updated = tasks
      .filter((t) => !isSubscribedToTask(referendumInfo, t))
      .map(
        (t) =>
          ({
            ...t,
            status: 'enable',
            referendumId,
          }) as IntervalSubscription
      );

    // Cache task data in referenda subscriptions context.
    for (const task of updated) {
      addReferendaSubscription({ ...task });
    }
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'addMulti',
      payload: { tasks: updated, onlineMode: getOnlineMode() },
    });

    const text = `Subscriptions added for referendum ${referendumId}.`;
    const toastId = `add-all-${tasks[0].chainId}-${referendumId}`;
    renderToast(text, toastId, 'success');
  };

  // Handles removing all addde subscriptions for a referendum.
  const removeAllIntervalSubscriptions = (
    tasks: IntervalSubscription[],
    referendumInfo: ReferendaInfo
  ) => {
    const { refId: referendumId } = referendumInfo;

    // Throw away task if it is not added.
    const updated = tasks
      .filter((t) => isSubscribedToTask(referendumInfo, t))
      .map(
        (t) =>
          ({
            ...t,
            status: 'disable',
            referendumId,
          }) as IntervalSubscription
      );

    // Cache task data in referenda subscriptions context.
    for (const task of updated) {
      removeReferendaSubscription({ ...task });
    }

    // Communicate with main renderer to remove subscription from controller.
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'removeMulti',
      payload: { tasks: updated, onlineMode: getOnlineMode() },
    });

    const text = `Subscriptions removed for referendum ${referendumId}.`;
    const toastId = `remove-all-${tasks[0].chainId}-${referendumId}`;
    renderToast(text, toastId, 'success');
  };

  return (
    <TaskHandlerContext
      value={{
        addIntervalSubscription,
        addAllIntervalSubscriptions,
        removeIntervalSubscription,
        removeAllIntervalSubscriptions,
      }}
    >
      {children}
    </TaskHandlerContext>
  );
};
