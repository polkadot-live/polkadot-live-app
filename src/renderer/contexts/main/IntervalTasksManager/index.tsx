// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import { createContext, useContext } from 'react';
import { useManage } from '../Manage';
import { useIntervalSubscriptions } from '../IntervalSubscriptions';
import type { IntervalSubscription } from '@/types/subscriptions';
import type { IntervalTasksManagerContextInterface } from './types';
import type { ReactNode } from 'react';
import * as defaults from './defaults';

export const IntervalTasksManagerContext =
  createContext<IntervalTasksManagerContextInterface>(
    defaults.defaultIntervalTasksManagerContext
  );

export const useIntervalTasksManager = () =>
  useContext(IntervalTasksManagerContext);

export const IntervalTasksManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { updateIntervalSubscription } = useIntervalSubscriptions();
  const { tryUpdateDynamicIntervalTask } = useManage();

  /// Handle toggling an interval subscription.
  const handleIntervalToggle = async (task: IntervalSubscription) => {
    // Invert task status.
    const newStatus = task.status === 'enable' ? 'disable' : 'enable';
    task.status = newStatus;

    // Handle task in intervals controller.
    newStatus === 'enable'
      ? IntervalsController.insertSubscription(task)
      : IntervalsController.removeSubscription(task);

    // Update main renderer state.
    updateIntervalSubscription(task);
    tryUpdateDynamicIntervalTask(task);

    // Update OpenGov renderer state.
    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:task:update',
      data: {
        serialized: JSON.stringify(task),
      },
    });

    // Update persisted task in store.
    await window.myAPI.updateIntervalTask(JSON.stringify(task));
  };

  return (
    <IntervalTasksManagerContext.Provider
      value={{
        handleIntervalToggle,
      }}
    >
      {children}
    </IntervalTasksManagerContext.Provider>
  );
};
