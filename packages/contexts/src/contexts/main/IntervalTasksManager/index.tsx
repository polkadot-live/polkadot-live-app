// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContextHook, renderToast } from '../../../utils';
import { useConnections } from '../../common';
import { useIntervalSubscriptions } from '../IntervalSubscriptions';
import { createContext, useState } from 'react';
import { getIntervalTaskManagerAdapter } from './adapters';
import { intervalDurationsConfig } from '@polkadot-live/consts/subscriptions/interval';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IntervalTasksManagerContextInterface } from '../../../types/main';
import type { ReactNode } from 'react';

export const IntervalTasksManagerContext = createContext<
  IntervalTasksManagerContextInterface | undefined
>(undefined);

export const useIntervalTasksManager = createSafeContextHook(
  IntervalTasksManagerContext,
  'IntervalTasksManagerContext'
);

export const IntervalTasksManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const adapter = getIntervalTaskManagerAdapter();
  const { getOnlineMode } = useConnections();
  const { updateIntervalSubscription, removeIntervalSubscription } =
    useIntervalSubscriptions();

  // Remove referendum dialog state.
  const [isRemoveRefDialogOpen, setIsRemoveRefDialogOpen] = useState(false);
  const [refIdToRemove, setRefIdToRemove] = useState<number | null>(null);

  // Utility to update an interval task.
  const updateIntervalTask = (task: IntervalSubscription) => {
    adapter.updateTask(task);
  };

  // Utility to handle an analytics event.
  const handleIntervalAnalytics = (task: IntervalSubscription) => {
    adapter.handleAnalytics(task);
  };

  // Handle toggling an interval subscription.
  const handleIntervalToggle = async (task: IntervalSubscription) => {
    const status = task.status === 'enable' ? 'disable' : 'enable';
    task.status = status;
    // Handle task in intervals controller.
    adapter.handleToggleSubscription(task, getOnlineMode());

    // Update store and renderer state.
    updateIntervalSubscription(task);
    updateIntervalTask(task);
  };

  // Handle clicking os notifications toggle for interval subscriptions.
  const handleIntervalNativeCheckbox = async (
    task: IntervalSubscription,
    flag: boolean
  ) => {
    const checked: boolean = flag;
    task.enableOsNotifications = checked;
    adapter.onUpdateSubscription(task);

    // Update store and renderer state.
    updateIntervalSubscription(task);
    updateIntervalTask(task);
  };

  // Handle setting a new interval duration for the subscription.
  const handleChangeIntervalDuration = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void
  ) => {
    const newSetting: number = parseInt(event.target.value);
    const settingObj = intervalDurationsConfig.find(
      (setting) => setting.ticksToWait === newSetting
    );
    if (settingObj) {
      // TODO: call useEffect in row component.
      setIntervalSetting(newSetting);

      // Update task state.
      task.intervalSetting = settingObj;
      updateIntervalSubscription(task);

      // Update store and view state.
      adapter.onUpdateSubscription(task);
      updateIntervalTask(task);
    }
  };

  // Handle a one-shot event for a subscription task.
  const handleIntervalOneShot = async (
    task: IntervalSubscription,
    setOneShotProcessing: AnyFunction
  ) => {
    setOneShotProcessing(true);
    const { success, message } = await adapter.executeOneShot(task);
    if (!success) {
      setOneShotProcessing(false);
      renderToast(message || 'Error', 'toast-error', 'error', 'bottom-center');
    } else {
      // Wait some time to avoid the spinner snapping.
      setTimeout(() => {
        setOneShotProcessing(false);
      }, 550);
    }
  };

  // Insert multiple subscriptions.
  const insertSubscriptions = (tasks: IntervalSubscription[]) => {
    adapter.onInsertSubscriptions(tasks, getOnlineMode());
  };

  // Remove multiple subscriptions.
  const removeSubscriptions = (tasks: IntervalSubscription[]) => {
    adapter.onRemoveSubscriptions(tasks, getOnlineMode());
  };

  const removeAllSubscriptions = async (
    chainId: ChainID,
    refId: number,
    tasks: IntervalSubscription[]
  ) => {
    for (const task of structuredClone(tasks)) {
      task.status = 'disable';
      removeIntervalSubscription(task);
    }
    adapter.onRemoveAllSubscriptions(chainId, refId, tasks, getOnlineMode());
  };

  return (
    <IntervalTasksManagerContext
      value={{
        isRemoveRefDialogOpen,
        refIdToRemove,
        setIsRemoveRefDialogOpen,
        setRefIdToRemove,
        insertSubscriptions,
        handleIntervalToggle,
        handleIntervalNativeCheckbox,
        handleChangeIntervalDuration,
        handleIntervalOneShot,
        handleIntervalAnalytics,
        removeSubscriptions,
        removeAllSubscriptions,
        updateIntervalTask,
      }}
    >
      {children}
    </IntervalTasksManagerContext>
  );
};
