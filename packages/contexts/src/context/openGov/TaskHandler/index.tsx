// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext } from 'react';
import { getTaskHandlerAdapter } from './adapters';
import { renderToast } from '@polkadot-live/ui/utils';
import { createSafeContextHook } from '../../../utils';
import { useConnections } from '../../common';
import { useReferendaSubscriptions } from '../ReferendaSubscriptions';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { TaskHandlerContextInterface } from '../../../types/openGov';

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
  const adapter = getTaskHandlerAdapter();
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
    adapter.addIntervalSubscriptionMessage(task, getOnlineMode());

    const text = `Subscription added for referendum ${referendumId}.`;
    const toastId = `add-${task.chainId}-${referendumId}-${task.action}`;
    renderToast(text, toastId, 'success');

    const { action } = task;
    adapter.handleAnalytics('referenda-subscribe', { action });
  };

  // Handles removing an interval subscription for a referendum.
  const removeIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ReferendaInfo
  ) => {
    // Set referendum ID on task.
    const { refId: referendumId } = referendumInfo;
    task.referendumId = referendumId;

    removeReferendaSubscription(task);
    adapter.removeIntervalSubscriptionMessage(task);

    const text = `Subscription removed for referendum ${referendumId}.`;
    const toastId = `remove-${task.chainId}-${referendumId}-${task.action}`;
    renderToast(text, toastId, 'success');

    const { action } = task;
    adapter.handleAnalytics('referenda-unsubscribe', { action });
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
    adapter.addIntervalSubscriptionsMessage(updated, getOnlineMode());
    const text = `Subscriptions added for referendum ${referendumId}.`;
    const toastId = `add-all-${tasks[0].chainId}-${referendumId}`;
    renderToast(text, toastId, 'success');
    adapter.handleAnalytics('referenda-subscribe-all', null);
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
    adapter.removeIntervalSubscriptionsMessage(updated, getOnlineMode());
    const text = `Subscriptions removed for referendum ${referendumId}.`;
    const toastId = `remove-all-${tasks[0].chainId}-${referendumId}`;
    renderToast(text, toastId, 'success');
    adapter.handleAnalytics('referenda-unsubscribe-all', null);
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
