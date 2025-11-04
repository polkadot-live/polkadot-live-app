// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  disconnectAPIs,
  AccountsController,
  APIsController,
  ConfigRenderer,
  ExtrinsicsController,
  SubscriptionsController,
  IntervalsController,
  getOnlineStatus,
} from '@polkadot-live/core';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook, useConnections } from '@polkadot-live/contexts';
import { setStateWithRef } from '@w3ux/utils';
import { startWithWorker } from 'dedot/smoldot/with-worker';
import { useApiHealth, useIntervalSubscriptions } from '@ren/contexts/main';
import type { AnyData } from '@polkadot-live/types/misc';
import type { BootstrappingInterface } from '@polkadot-live/contexts/types/main';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IpcTask } from '@polkadot-live/types/communication';

export const BootstrappingContext = createContext<
  BootstrappingInterface | undefined
>(undefined);

export const useBootstrapping = createSafeContextHook(
  BootstrappingContext,
  'BootstrappingContext'
);

export const BootstrappingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { startApi } = useApiHealth();
  const { addIntervalSubscription } = useIntervalSubscriptions();
  const { cacheGet } = useConnections();
  const isConnected = cacheGet('mode:connected');

  const [appLoading, setAppLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const refAppInitialized = useRef(false);
  const refAborted = useRef(false);
  const refSwitchingToOnline = useRef(false);

  /**
   * Notify main process there may be a change in connection status.
   */
  const handleOnline = () => {
    window.myAPI.relaySharedState('mode:connected', true);
  };

  const handleOffline = () => {
    window.myAPI.relaySharedState('mode:connected', false);
  };

  /**
   * Initialize smoldot.
   */
  const initSmoldot = async () => {
    const SmoldotWorker = new Worker(
      new URL('dedot/smoldot/worker', import.meta.url),
      { type: 'module' }
    );

    APIsController.smoldotClient = startWithWorker(SmoldotWorker);
  };

  /**
   * Initialize application systems.
   */
  const initSystems = async () => {
    const backend = 'electron';
    ExtrinsicsController.backend = backend;
    SubscriptionsController.backend = backend;

    await initSmoldot();
    await Promise.all([
      APIsController.initialize(backend),
      AccountsController.initialize(backend),
    ]);
    await Promise.all([
      AccountsController.initAccountSubscriptions(backend),
      SubscriptionsController.initChainSubscriptions(),
    ]);
  };

  /**
   * Connect APIs and restore systems.
   */
  const connectAPIs = async () => {
    const isOnline = await getOnlineStatus('electron');
    if (isOnline) {
      const chainIds = Array.from(AccountsController.accounts.keys());
      await Promise.all(chainIds.map((c) => startApi(c)));
    }
  };

  /**
   * Handle app initialization.
   */
  const handleInitializeApp = async () => {
    if (!refAppInitialized.current) {
      setAppLoading(true);

      await initSystems();
      const initTasks: (() => Promise<AnyData>)[] = [
        connectAPIs,
        initIntervalsController,
        disconnectAPIs,
      ];

      // Always initialize intervals controller.
      for (const [index, task] of initTasks.entries()) {
        index === 1 ? await task() : !refAborted.current && (await task());
      }

      // Set application state.
      AccountsController.syncState();
      SubscriptionsController.syncState();
      refAppInitialized.current = true; // Set app initialized flag.

      // Set app in offline mode if connection processing was aborted.
      if (refAborted.current) {
        setStateWithRef(false, setIsAborting, refAborted);
        await handleInitializeAppOffline();
      }

      // Wait 100ms to avoid a snapping loading spinner.
      setTimeout(() => {
        setAppLoading(false);
      }, 100);
    }
  };

  /**
   * Handle switching to offline mode.
   */
  const handleInitializeAppOffline = async () => {
    // Set config flag to false to re-start the online mode initialization
    // when connection status goes back online.
    refSwitchingToOnline.current = false;

    // Stop subscription intervals timer.
    IntervalsController.stopInterval();

    // Report online status to renderers.
    const isOnline = await getOnlineStatus('electron');
    window.myAPI.relaySharedState('mode:connected', isOnline);
    window.myAPI.relaySharedState('mode:online', false);

    // Disconnect from chains.
    await APIsController.closeAll();
  };

  /**
   * Handle switching to online mode.
   */
  const handleInitializeAppOnline = async () => {
    if (refSwitchingToOnline.current) {
      return;
    }

    // Set config flag to `true` to make sure the app doesn't re-execute
    // this function's logic whilst the connection status is online.
    refSwitchingToOnline.current = true;
    const initTasks: (() => Promise<AnyData>)[] = [connectAPIs, disconnectAPIs];

    for (const [index, task] of initTasks.entries()) {
      if (!refAborted.current && index === 1) {
        // Initialise intervals controller before disconnecting APIs.
        IntervalsController.initIntervals(true);
        await task();
      } else if (!refAborted.current) {
        await task();
      }
    }

    SubscriptionsController.syncState();
    refSwitchingToOnline.current = false;

    if (refAborted.current) {
      setStateWithRef(false, setIsAborting, refAborted);
      await handleInitializeAppOffline();
    } else {
      // Report online status to renderers.
      const isOnline = await getOnlineStatus('electron');
      window.myAPI.relaySharedState('mode:connected', isOnline);
      window.myAPI.relaySharedState('mode:online', isOnline);
    }
  };

  /**
   * Util for initializing the intervals controller.
   */
  const initIntervalsController = async () => {
    const ipcTask: IpcTask = { action: 'interval:task:get', data: null };
    const serialized = (await window.myAPI.sendIntervalTask(ipcTask)) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);

    // Insert subscriptions and start interval if online.
    const isOnline = await getOnlineStatus('electron');
    IntervalsController.insertSubscriptions(tasks, isOnline);

    // Add tasks to React state in main window.
    // When the OpenGov view is open, the task state is synced in a separate function.
    for (const task of tasks) {
      addIntervalSubscription({ ...task });
    }
  };

  /**
   * Called when initializing the openGov window.
   */
  const syncOpenGovWindow = async () => {
    const ipcTask: IpcTask = { action: 'interval:task:get', data: null };
    const serialized = (await window.myAPI.sendIntervalTask(ipcTask)) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);

    // Add tasks to React state in main and open gov window.
    for (const task of tasks) {
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:task:add',
        data: {
          serialized: JSON.stringify({ ...task }),
        },
      });
    }
  };

  /**
   * Handle event listeners.
   */
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Handle Dedot clients when online mode changes.
   */
  useEffect(() => {
    const disconnectAll = async () => {
      await APIsController.closeAll();
    };

    if (!isConnected) {
      disconnectAll();
    }
  }, [isConnected]);

  /**
   * Handle abort flag.
   */
  useEffect(() => {
    if (ConfigRenderer.abortConnecting) {
      ConfigRenderer.abortConnecting = false;
      refAborted.current = true;
    }
  }, [ConfigRenderer.abortConnecting]);

  return (
    <BootstrappingContext
      value={{
        appLoading,
        isAborting,
        isConnecting,
        setAppLoading,
        setIsAborting,
        setIsConnecting,
        handleInitializeApp,
        handleInitializeAppOffline,
        handleInitializeAppOnline,
        syncOpenGovWindow,
      }}
    >
      {children}
    </BootstrappingContext>
  );
};
