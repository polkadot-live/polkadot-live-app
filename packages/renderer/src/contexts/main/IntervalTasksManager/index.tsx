// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ConfigRenderer,
  executeIntervaledOneShot,
  IntervalsController,
} from '@polkadot-live/core';
import { Flip, toast } from 'react-toastify';
import { createContext, useContext } from 'react';
import { useConnections } from '@ren/contexts/common';
import { useManage } from '@ren/contexts/main/Manage';
import { useIntervalSubscriptions } from '@ren/contexts/main/IntervalSubscriptions';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
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
  const { getOnlineMode } = useConnections();
  const { updateIntervalSubscription, removeIntervalSubscription } =
    useIntervalSubscriptions();
  const { tryUpdateDynamicIntervalTask, tryRemoveIntervalSubscription } =
    useManage();

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
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:task:update',
      data: {
        serialized: JSON.stringify(task),
      },
    });

    // Update persisted task in store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:task:update',
      data: { serialized: JSON.stringify(task) },
    });

    // Analytics.
    const { action, category } = task;
    const event = `subscription-interval-${newStatus === 'enable' ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { action, category });
  };

  /// Handle clicking os notifications toggle for interval subscriptions.
  const handleIntervalNativeCheckbox = async (
    task: IntervalSubscription,
    flag: boolean
  ) => {
    const checked: boolean = flag;
    task.enableOsNotifications = checked;

    // Update task data in intervals controller.
    IntervalsController.updateSubscription(task);

    // Update main renderer state.
    updateIntervalSubscription(task);
    tryUpdateDynamicIntervalTask(task);

    // Update OpenGov renderer state.
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:task:update',
      data: {
        serialized: JSON.stringify(task),
      },
    });

    // Update persisted task in store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:task:update',
      data: { serialized: JSON.stringify(task) },
    });
  };

  /// Handle removing an interval subscription.
  const handleRemoveIntervalSubscription = async (
    task: IntervalSubscription
  ) => {
    // Remove task from interval controller.
    task.status === 'enable' &&
      IntervalsController.removeSubscription(task, getOnlineMode());

    // Set status to disable.
    task.status = 'disable';

    // Remove task from necessary React state.
    tryRemoveIntervalSubscription(task);
    removeIntervalSubscription(task);

    // Remove task from store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:task:remove',
      data: { serialized: JSON.stringify(task) },
    });

    // Send message to OpenGov window to update its subscription state.
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:task:removed',
      data: { serialized: JSON.stringify(task) },
    });
  };

  /// Handle setting a new interval duration for the subscription.
  const handleChangeIntervalDuration = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void
  ) => {
    const newSetting: number = parseInt(event.target.value);
    const settingObj = IntervalsController.durations.find(
      (setting) => setting.ticksToWait === newSetting
    );

    if (settingObj) {
      // TODO: call useEffect in row component.
      setIntervalSetting(newSetting);

      // Update task state.
      task.intervalSetting = settingObj;
      updateIntervalSubscription(task);
      tryUpdateDynamicIntervalTask(task);

      // Update managed task in intervals controller.
      IntervalsController.updateSubscription(task);

      // Update state in OpenGov window.
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:task:update',
        data: {
          serialized: JSON.stringify(task),
        },
      });

      // Update persisted task in store.
      await window.myAPI.sendIntervalTask({
        action: 'interval:task:update',
        data: { serialized: JSON.stringify(task) },
      });
    }
  };

  /// Handle a one-shot event for a subscription task.
  const handleIntervalOneShot = async (
    task: IntervalSubscription,
    setOneShotProcessing: AnyFunction
  ) => {
    setOneShotProcessing(true);
    const { success, message } = await executeIntervaledOneShot(
      task,
      'one-shot'
    );

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

      // Analytics.
      const { action, category } = task;
      window.myAPI.umamiEvent('oneshot-interval', { action, category });
    }
  };

  return (
    <IntervalTasksManagerContext.Provider
      value={{
        handleIntervalToggle,
        handleIntervalNativeCheckbox,
        handleRemoveIntervalSubscription,
        handleChangeIntervalDuration,
        handleIntervalOneShot,
      }}
    >
      {children}
    </IntervalTasksManagerContext.Provider>
  );
};
