// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { createContext, useContext } from 'react';
import { useReferendaSubscriptions } from '../ReferendaSubscriptions';
import { Flip, toast } from 'react-toastify';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { IntervalSubscription } from '@/types/subscriptions';
import type { TaskHandlerContextInterface } from './types';

export const TaskHandlerContext = createContext<TaskHandlerContextInterface>(
  defaults.defaultTaskHandlerContext
);

export const useTaskHandler = () => useContext(TaskHandlerContext);

export const TaskHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    addReferendaSubscription,
    removeReferendaSubscription,
    isSubscribedToTask,
  } = useReferendaSubscriptions();

  /// Utility to render toastify notification.
  const showToastSuccess = (text: string, toastId: string) => {
    toast.success(text, {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'dark',
      transition: Flip,
      toastId,
    });
  };

  /// Handles adding an interval subscription for a referendum.
  const addIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ActiveReferendaInfo
  ) => {
    // Set referendum ID on task.
    const { referendaId: referendumId } = referendumInfo;
    task.referendumId = referendumId;

    // Enable the task by default.
    task.status = 'enable';

    // Cache subscription in referenda subscriptions context.
    addReferendaSubscription({ ...task });

    // Communicate with main renderer to process subscription task.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:add',
      data: {
        task: JSON.stringify(task),
      },
    });

    const text = `Subscription added for referendum ${referendumId}.`;
    const toastId = `add-${task.chainId}-${referendumId}-${task.action}`;
    showToastSuccess(text, toastId);

    // Analytics.
    const { action } = task;
    window.myAPI.umamiEvent('referenda-subscribe', { action });
  };

  /// Handles removing an interval subscription for a referendum.
  const removeIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ActiveReferendaInfo
  ) => {
    // Set referendum ID on task.
    const { referendaId: referendumId } = referendumInfo;
    task.referendumId = referendumId;

    // Remove subscription in referenda subscriptions context.
    removeReferendaSubscription(task);

    // Communicate with main renderer to remove subscription from controller.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:remove',
      data: {
        task: JSON.stringify(task),
      },
    });

    const text = `Subscription removed for referendum ${referendumId}.`;
    const toastId = `remove-${task.chainId}-${referendumId}-${task.action}`;
    showToastSuccess(text, toastId);

    // Analytics.
    const { action } = task;
    window.myAPI.umamiEvent('referenda-unsubscribe', { action });
  };

  /// Handles adding all available subscriptions for a referendum.
  const addAllIntervalSubscriptions = (
    tasks: IntervalSubscription[],
    referendumInfo: ActiveReferendaInfo
  ) => {
    const { referendaId: referendumId } = referendumInfo;

    // Throw away task if it's already added and set required fields.
    const updated = tasks
      .filter((t) => !isSubscribedToTask(referendumInfo, t))
      .map(
        (t) =>
          ({ ...t, status: 'enable', referendumId }) as IntervalSubscription
      );

    // Cache task data in referenda subscriptions context.
    for (const task of updated) {
      addReferendaSubscription({ ...task });
    }

    // Communicate with main renderer to process subscription tasks.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:add:multi',
      data: {
        tasks: JSON.stringify(updated),
      },
    });

    const text = `Subscriptions added for referendum ${referendumId}.`;
    const toastId = `add-all-${tasks[0].chainId}-${referendumId}`;
    showToastSuccess(text, toastId);

    // Analytics.
    window.myAPI.umamiEvent('referenda-subscribe-all', null);
  };

  /// Handles removing all addde subscriptions for a referendum.
  const removeAllIntervalSubscriptions = (
    tasks: IntervalSubscription[],
    referendumInfo: ActiveReferendaInfo
  ) => {
    const { referendaId: referendumId } = referendumInfo;

    // Throw away task if it is not added.
    const updated = tasks
      .filter((t) => isSubscribedToTask(referendumInfo, t))
      .map(
        (t) =>
          ({ ...t, status: 'disable', referendumId }) as IntervalSubscription
      );

    // Cache task data in referenda subscriptions context.
    for (const task of updated) {
      removeReferendaSubscription({ ...task });
    }

    // Communicate with main renderer to remove subscription from controller.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:remove:multi',
      data: {
        tasks: JSON.stringify(updated),
      },
    });

    const text = `Subscriptions removed for referendum ${referendumId}.`;
    const toastId = `remove-all-${tasks[0].chainId}-${referendumId}`;
    showToastSuccess(text, toastId);

    // Analytics.
    window.myAPI.umamiEvent('referenda-unsubscribe-all', null);
  };

  return (
    <TaskHandlerContext.Provider
      value={{
        addIntervalSubscription,
        addAllIntervalSubscriptions,
        removeIntervalSubscription,
        removeAllIntervalSubscriptions,
      }}
    >
      {children}
    </TaskHandlerContext.Provider>
  );
};
