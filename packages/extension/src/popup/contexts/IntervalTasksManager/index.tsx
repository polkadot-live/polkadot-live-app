// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  createSafeContextHook,
  useConnections,
  useManage,
} from '@polkadot-live/contexts';
import { Flip, toast } from 'react-toastify';
import { createContext } from 'react';
import { useIntervalSubscriptions } from '../../contexts';
import { intervalDurationsConfig } from '@polkadot-live/consts/subscriptions/interval';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IntervalTasksManagerContextInterface } from '@polkadot-live/contexts/types/main';
import type { OneShotReturn } from '@polkadot-live/types/openGov';
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
  const { getOnlineMode } = useConnections();
  const { updateIntervalSubscription, removeIntervalSubscription } =
    useIntervalSubscriptions();
  const { tryUpdateDynamicIntervalTask, tryRemoveIntervalSubscription } =
    useManage();

  /// Utility to update an interval task.
  const updateIntervalTask = (task: IntervalSubscription) => {
    try {
      chrome.runtime.sendMessage({
        type: 'intervalSubscriptions',
        task: 'syncIntervalSubscriptionUpdate',
        payload: { task },
      });
    } catch (error) {
      console.error(error);
    }
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'update',
      payload: { task },
    });
  };

  /// Utility to handle an analytics event.
  const handleIntervalAnalytics = () => {
    /* empty */
  };

  /// Handle toggling an interval subscription.
  const handleIntervalToggle = async (task: IntervalSubscription) => {
    const status = task.status === 'enable' ? 'disable' : 'enable';
    task.status = status;

    // Handle task in intervals controller.
    await chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: status === 'enable' ? 'insertSubscription' : 'removeSubscription',
      payload: { task, onlineMode: getOnlineMode() },
    });
    // Update store and renderer state.
    updateIntervalSubscription(task);
    tryUpdateDynamicIntervalTask(task);
    updateIntervalTask(task);
  };

  /// Handle clicking os notifications toggle for interval subscriptions.
  const handleIntervalNativeCheckbox = async (
    task: IntervalSubscription,
    flag: boolean
  ) => {
    const checked: boolean = flag;
    task.enableOsNotifications = checked;

    // Update store and renderer state.
    updateIntervalSubscription(task);
    tryUpdateDynamicIntervalTask(task);
    updateIntervalTask(task);
  };

  /// Handle removing an interval subscription.
  const handleRemoveIntervalSubscription = async (
    task: IntervalSubscription
  ) => {
    // Remove task from store and controller.
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'remove',
      payload: { task, onlineMode: getOnlineMode() },
    });

    // Set status to disable and update state.
    task.status = 'disable';
    tryRemoveIntervalSubscription(task);
    removeIntervalSubscription(task);

    try {
      chrome.runtime.sendMessage({
        type: 'intervalSubscriptions',
        task: 'syncIntervalSubscriptionRemove',
        payload: { task },
      });
    } catch (error) {
      console.error(error);
    }
  };

  /// Handle setting a new interval duration for the subscription.
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
      tryUpdateDynamicIntervalTask(task);

      // Update store and view state.
      updateIntervalTask(task);
    }
  };

  /// Handle a one-shot event for a subscription task.
  const handleIntervalOneShot = async (
    task: IntervalSubscription,
    setOneShotProcessing: AnyFunction
  ) => {
    setOneShotProcessing(true);
    const { success, message } = (await chrome.runtime.sendMessage({
      type: 'oneShot',
      task: 'executeInterval',
      payload: { task },
    })) as OneShotReturn;

    if (!success) {
      setOneShotProcessing(false);

      // Render error alert.
      toast.error(message ? message : 'Error', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId: 'toast-connection',
      });
    } else {
      // Wait some time to avoid the spinner snapping.
      setTimeout(() => {
        setOneShotProcessing(false);
      }, 550);
    }
  };

  /// Insert multiple subscriptions.
  const insertSubscriptions = (tasks: IntervalSubscription[]) => {
    const onlineMode = getOnlineMode();
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'insertSubscriptions',
      payload: { tasks, onlineMode },
    });
  };

  /// Remove multiple subscriptions.
  const removeSubscriptions = (tasks: IntervalSubscription[]) => {
    const onlineMode = getOnlineMode();
    chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'removeSubscriptions',
      payload: { tasks, onlineMode },
    });
  };

  return (
    <IntervalTasksManagerContext
      value={{
        insertSubscriptions,
        handleIntervalToggle,
        handleIntervalNativeCheckbox,
        handleRemoveIntervalSubscription,
        handleChangeIntervalDuration,
        handleIntervalOneShot,
        handleIntervalAnalytics,
        removeSubscriptions,
        updateIntervalTask,
      }}
    >
      {children}
    </IntervalTasksManagerContext>
  );
};
