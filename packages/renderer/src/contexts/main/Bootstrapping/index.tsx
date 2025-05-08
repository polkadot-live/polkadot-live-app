// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as AccountsLib from '@core/library/AccountsLib';
import * as CommonLib from '@core/library/CommonLib';
import * as smoldot from 'smoldot/no-auto-bytecode';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccountsController,
  APIsController,
  SubscriptionsController,
  IntervalsController,
} from '@core/controllers';
import { defaultBootstrappingContext } from './default';
import { Config as RendererConfig } from '@core/config/renderer';
import { ChainList } from '@polkadot-live/consts/chains';
import { useConnections } from '@ren/contexts/common/Connections';
import { useIntervalSubscriptions } from '@ren/contexts/main/IntervalSubscriptions';
import { disconnectAPIs } from '@core/library/ApiLib';
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
  const { isConnected: systemConnected } = useConnections();

  const [appLoading, setAppLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const refAppInitialized = useRef(false);
  const refAborted = useRef(false);
  const refSwitchingToOnline = useRef(false);

  /// Notify main process there may be a change in connection status.
  const handleOnline = () => {
    window.myAPI.sendConnectionTask({
      action: 'connection:setStatus',
      data: null,
    });
  };

  /// Notify main process there may be a change in connection status.
  const handleOffline = () => {
    window.myAPI.sendConnectionTask({
      action: 'connection:setStatus',
      data: null,
    });
  };

  /// Step 1: Initialize chain APIs (disconnected).
  const initSmoldot = async () => {
    const waitForWorkerMessage = async (worker: Worker): Promise<AnyData> =>
      new Promise((resolve) => {
        worker.onmessage = (event) => {
          resolve(event.data);
        };
      });

    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    // Wait for bytecode.
    const bytecode: AnyData = await waitForWorkerMessage(worker);
    const { port1, port2 } = new MessageChannel();
    worker.postMessage(port1, [port1]);

    APIsController.smoldotClient = smoldot.startWithBytecode({
      bytecode,
      forbidWs: true,
      maxLogLevel: 0,
      portToWorker: port2,
    });
  };

  const initChainAPIs = async () => {
    const chainIds = Array.from(ChainList.keys());
    await APIsController.initialize(chainIds);
    await initSmoldot();
  };

  /// Step 2: Initialize accounts.
  const initAccounts = async () => await AccountsController.initialize();

  /// Step 3: Connect necessary API instances.
  const connectAPIs = async () => {
    const isConnected: boolean = await CommonLib.getOnlineStatus();
    if (isConnected) {
      const chainIds = Array.from(AccountsController.accounts.keys());
      await Promise.all(chainIds.map((c) => APIsController.connectApi(c)));
    }
  };

  /// Step 4: Fetch current account data.
  const fetchAccountData = async () => {
    const isConnected: boolean = await CommonLib.getOnlineStatus();
    if (isConnected) {
      await Promise.all([
        AccountsLib.setAccountBalances(),
        AccountsLib.setAccountsNominationPoolData(),
        AccountsLib.setAccountsNominatingData(),
      ]);
    }
  };

  /// Step 5: Initiate subscriptions.
  const initSubscriptions = async () => {
    await Promise.all([
      AccountsController.subscribeAccounts(),
      SubscriptionsController.initChainSubscriptions(),
    ]);
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

    if (!systemConnected) {
      disconnectAll();
    } else {
      // TODO: Handle online mode.
    }
  }, [systemConnected]);

  /// Handle abort flag.
  useEffect(() => {
    if (RendererConfig.abortConnecting) {
      RendererConfig.abortConnecting = false;
      refAborted.current = true;
    }
  }, [RendererConfig.abortConnecting]);

  /// Handle app initialization.
  const handleInitializeApp = async () => {
    if (!refAppInitialized.current) {
      setAppLoading(true);

      // Initialize APIs and smoldot light client.
      await initChainAPIs();

      // Initialise online status controller and set online state.
      await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:init',
        data: null,
      });

      const isConnected: boolean = await CommonLib.getOnlineStatus();
      window.myAPI.relaySharedState('isOnlineMode', isConnected);
      window.myAPI.relaySharedState('isConnected', isConnected);

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
      syncSubscriptionsState();
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
    window.myAPI.relaySharedState('isOnlineMode', false);
    window.myAPI.relaySharedState(
      'isConnected',
      await CommonLib.getOnlineStatus()
    );

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

    syncSubscriptionsState();
    refSwitchingToOnline.current = false;

    if (refAborted.current) {
      refAborted.current = false;
      setIsAborting(false);
      await handleInitializeAppOffline();
    } else {
      // Report online status to renderers.
      const status = await CommonLib.getOnlineStatus();
      window.myAPI.relaySharedState('isOnlineMode', status);
      window.myAPI.relaySharedState('isConnected', status);
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
    syncSubscriptionsState();
  };

  /// Util for initializing the intervals controller.
  const initIntervalsController = async () => {
    const isConnected: boolean = await CommonLib.getOnlineStatus();
    const ipcTask: IpcTask = { action: 'interval:task:get', data: null };
    const serialized = (await window.myAPI.sendIntervalTask(ipcTask)) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);

    // Insert subscriptions and start interval if online.
    IntervalsController.insertSubscriptions(tasks, isConnected);

    // Add tasks to React state in main window.
    // When the OpenGov view is open, the task state is synced in a separate function.
    for (const task of tasks) {
      addIntervalSubscription({ ...task });
    }
  };

  /// Util for syncing react subscriptions state.
  const syncSubscriptionsState = () => {
    SubscriptionsController.syncChainSubscriptionsState();
    SubscriptionsController.syncAccountSubscriptionsState();
  };

  /// Called when initializing the openGov window.
  const syncOpenGovWindow = async () => {
    const ipcTask: IpcTask = { action: 'interval:task:get', data: null };
    const serialized = (await window.myAPI.sendIntervalTask(ipcTask)) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);

    // Add tasks to React state in main and open gov window.
    for (const task of tasks) {
      RendererConfig.portToOpenGov?.postMessage({
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
