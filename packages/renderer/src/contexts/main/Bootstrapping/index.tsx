// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  disconnectAPIs,
  AccountsController,
  APIsController,
  ConfigRenderer,
  SubscriptionsController,
  IntervalsController,
  getOnlineStatus,
} from '@polkadot-live/core';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defaultBootstrappingContext } from './default';
import { startWithWorker } from 'dedot/smoldot/with-worker';
import { useConnections } from '@ren/contexts/common';
import { useIntervalSubscriptions } from '@ren/contexts/main';
import type { AnyData } from '@polkadot-live/types/misc';
import type { BootstrappingInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { NodeEndpoint } from '@polkadot-live/types/apis';

export const BootstrappingContext = createContext<BootstrappingInterface>(
  defaultBootstrappingContext
);

export const useBootstrapping = () => useContext(BootstrappingContext);

export const BootstrappingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { addIntervalSubscription } = useIntervalSubscriptions();
  const { cacheGet } = useConnections();
  const isConnected = cacheGet('mode:connected');

  const [appLoading, setAppLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const refAppInitialized = useRef(false);
  const refAborted = useRef(false);
  const refSwitchingToOnline = useRef(false);

  /// Notify main process there may be a change in connection status.
  const handleOnline = () => {
    window.myAPI.relaySharedState('mode:connected', true);
  };

  const handleOffline = () => {
    window.myAPI.relaySharedState('mode:connected', false);
  };

  /// Step 1: Initialize chain APIs (disconnected).
  const initSmoldot = async () => {
    const SmoldotWorker = new Worker(
      new URL('dedot/smoldot/worker', import.meta.url),
      { type: 'module' }
    );

    APIsController.smoldotClient = startWithWorker(SmoldotWorker);
  };

  const initChainAPIs = async () => {
    await APIsController.initialize();
    await initSmoldot();
  };

  /// Step 2: Initialize accounts.
  const initAccounts = async () => await AccountsController.initialize();

  /// Step 3: Connect necessary API instances.
  const connectAPIs = async () => {
    try {
      const isOnline = await getOnlineStatus();
      if (isOnline) {
        const chainIds = Array.from(AccountsController.accounts.keys());
        await Promise.all(chainIds.map((c) => APIsController.connectApi(c)));
      }
    } catch (err) {
      // TODO: Handle connection error.
      console.error(err);
    }
  };

  /// Step 4: Fetch current account data.
  const fetchAccountData = async () => {
    const isOnline = await getOnlineStatus();
    if (isOnline) {
      for (const chainId of AccountsController.getManagedChains()) {
        const res = await APIsController.getConnectedApiOrThrow(chainId);
        const api = res.getApi();
        await AccountsController.syncAllAccounts(api, chainId);
      }
    }
  };

  /// Step 5: Initiate subscriptions.
  const initSubscriptions = async () => {
    const isOnline = await getOnlineStatus();
    if (isOnline) {
      await Promise.all([
        AccountsController.subscribeAccounts(),
        SubscriptionsController.initChainSubscriptions(),
      ]);
    }
  };

  /// Handle event listeners.
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /// Handle Dedot clients when online mode changes.
  useEffect(() => {
    const disconnectAll = async () => {
      await APIsController.closeAll();
    };

    if (!isConnected) {
      disconnectAll();
    } else {
      // TODO: Handle online mode.
    }
  }, [isConnected]);

  /// Handle abort flag.
  useEffect(() => {
    if (ConfigRenderer.abortConnecting) {
      ConfigRenderer.abortConnecting = false;
      refAborted.current = true;
    }
  }, [ConfigRenderer.abortConnecting]);

  /// Handle app initialization.
  const handleInitializeApp = async () => {
    if (!refAppInitialized.current) {
      setAppLoading(true);

      // Initialize APIs and smoldot light client.
      await initChainAPIs();

      const initTasks: (() => Promise<AnyData>)[] = [
        initAccounts,
        connectAPIs,
        fetchAccountData,
        initSubscriptions,
        initIntervalsController,
        disconnectAPIs,
      ];

      for (const [index, task] of initTasks.entries()) {
        if (index === 4) {
          // Always initialize intervals controller.
          await task();
        } else if (!refAborted.current) {
          await task();
        }
      }

      // Set application state.
      AccountsController.syncState();
      SubscriptionsController.syncState();
      refAppInitialized.current = true; // Set app initialized flag.

      // Set app in offline mode if connection processing was aborted.
      if (refAborted.current) {
        refAborted.current = false;
        await handleInitializeAppOffline();
        setIsAborting(false);
      }

      // Wait 100ms to avoid a snapping loading spinner.
      console.log('App initialized...');
      setTimeout(() => {
        setAppLoading(false);
      }, 100);
    }
  };

  /// Handle switching to offline mode.
  const handleInitializeAppOffline = async () => {
    // Set config flag to false to re-start the online mode initialization
    // when connection status goes back online.
    refSwitchingToOnline.current = false;

    // Stop subscription intervals timer.
    IntervalsController.stopInterval();

    // Report online status to renderers.
    const isOnline = await getOnlineStatus();
    window.myAPI.relaySharedState('mode:connected', isOnline);
    window.myAPI.relaySharedState('mode:online', false);

    // Disconnect from chains.
    await APIsController.closeAll();
  };

  /// Handle switching to online mode.
  const handleInitializeAppOnline = async () => {
    if (refSwitchingToOnline.current) {
      return;
    }

    // Set config flag to `true` to make sure the app doesn't re-execute
    // this function's logic whilst the connection status is online.
    refSwitchingToOnline.current = true;

    const initTasks: (() => Promise<AnyData>)[] = [
      connectAPIs,
      fetchAccountData,
      initSubscriptions,
      disconnectAPIs,
    ];

    for (const [index, task] of initTasks.entries()) {
      if (!refAborted.current && index === 3) {
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
      refAborted.current = false;
      setIsAborting(false);
      await handleInitializeAppOffline();
    } else {
      // Report online status to renderers.
      const isOnline = await getOnlineStatus();
      window.myAPI.relaySharedState('mode:connected', isOnline);
      window.myAPI.relaySharedState('mode:online', isOnline);
    }
  };

  /// Re-subscribe to tasks when switching to a different endpoint.
  const handleNewEndpointForChain = async (
    chainId: ChainID,
    newEndpoint: NodeEndpoint
  ) => {
    await APIsController.connectEndpoint(chainId, newEndpoint);

    // Re-subscribe account and chain tasks.
    if (APIsController.getStatus(chainId) === 'connected') {
      await Promise.all([
        AccountsController.subscribeAccountsForChain(chainId),
        SubscriptionsController.resubscribeChain(chainId),
      ]);
    }
    SubscriptionsController.syncState();
  };

  /// Util for initializing the intervals controller.
  const initIntervalsController = async () => {
    const ipcTask: IpcTask = { action: 'interval:task:get', data: null };
    const serialized = (await window.myAPI.sendIntervalTask(ipcTask)) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);

    // Insert subscriptions and start interval if online.
    const isOnline = await getOnlineStatus();
    IntervalsController.insertSubscriptions(tasks, isOnline);

    // Add tasks to React state in main window.
    // When the OpenGov view is open, the task state is synced in a separate function.
    for (const task of tasks) {
      addIntervalSubscription({ ...task });
    }
  };

  /// Called when initializing the openGov window.
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

  return (
    <BootstrappingContext.Provider
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
        handleNewEndpointForChain,
        syncOpenGovWindow,
      }}
    >
      {children}
    </BootstrappingContext.Provider>
  );
};
