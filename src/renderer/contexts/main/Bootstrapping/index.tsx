// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defaultBootstrappingContext } from './default';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { ChainList } from '@/config/chains';
import {
  fetchAccountBalances,
  fetchAccountNominatingData,
  fetchAccountNominationPoolData,
} from '@/utils/AccountUtils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useChains } from '../Chains';
import { useSubscriptions } from '../Subscriptions';
import { useIntervalSubscriptions } from '../IntervalSubscriptions';
import { handleApiDisconnects } from '@/utils/ApiUtils';
import type { BootstrappingInterface } from './types';
import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/types/subscriptions';
import type { IpcTask } from '@/types/communication';

export const BootstrappingContext = createContext<BootstrappingInterface>(
  defaultBootstrappingContext
);

export const useBootstrapping = () => useContext(BootstrappingContext);

export const BootstrappingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [appLoading, setAppLoading] = useState(false);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [online, setOnline] = useState<boolean>(false);

  const { addChain } = useChains();
  const { setAddresses } = useAddresses();
  const { setChainSubscriptions, setAccountSubscriptions } = useSubscriptions();
  const { addIntervalSubscription } = useIntervalSubscriptions();

  const refAppInitialized = useRef(false);

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

  /// Handle event listeners.
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /// Handle app initialization.
  const handleInitializeApp = async () => {
    if (!refAppInitialized.current) {
      setAppLoading(true);

      let aborted = false;
      let intervalRunning = true;

      // Start an interval to check if the abort flag has been set.
      const intervalId = setInterval(() => {
        if (RendererConfig.abortConnecting) {
          // Reset abort connecting flag.
          RendererConfig.abortConnecting = false;

          // Set flag to stop processing this function.
          aborted = true;

          // Stop this interval.
          clearInterval(intervalId);
          intervalRunning = false;
        }
      }, 1000);

      // Initialise online status controller and set online state.
      await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:init',
        data: null,
      });

      const isOnline: boolean =
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false;

      setOnline(isOnline);

      // Initialize accounts from persisted state.
      await AccountsController.initialize();

      // Initialize chain APIs.
      APIsController.initialize(Array.from(ChainList.keys()));

      // Fetch up-to-date account data.
      if (isOnline && !aborted) {
        // Connect required API instances before continuing.
        const chainIds = Array.from(AccountsController.accounts.keys());
        await Promise.all(
          chainIds.map((cid) => APIsController.connectInstance(cid))
        );

        await Promise.all([
          // Fetch account nonce and balance.
          fetchAccountBalances(),
          // Use API instance to initialize account nomination pool data.
          fetchAccountNominationPoolData(),
          // Initialize account nominating data.
          fetchAccountNominatingData(),
        ]);
      }

      // Initialize account and chain subscriptions.
      if (!aborted && isOnline) {
        await Promise.all([
          AccountsController.subscribeAccounts(),
          SubscriptionsController.initChainSubscriptions(),
        ]);
      }

      // Initialise intervals controller and interval subscriptions.
      await initIntervalsController(isOnline);

      // Set accounts to render.
      setAddresses(AccountsController.getAllFlattenedAccountData());

      // Disconnect from any API instances that are not currently needed.
      if (isOnline) {
        await handleApiDisconnects();
      }

      // Set application state.
      setSubscriptionsAndChainConnections();

      refAppInitialized.current = true;

      // Stop abort checking interval.
      intervalRunning && clearInterval(intervalId);

      // Set app in offline mode if connection processing was aborted.
      if (aborted) {
        await handleInitializeAppOffline();
        setIsAborting(false);
      }

      // Notify import renderer of connection status.
      if (!aborted) {
        for (const windowId of ['import', 'openGov']) {
          reportConnectionStatusToWindow(windowId, isOnline);
        }
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
    RendererConfig.switchingToOnlineMode = false;

    // Stop subscription intervals timer.
    IntervalsController.stopInterval();

    // Report online status to renderer.
    setOnline(false);

    // Notify import renderer of connection status.
    for (const windowId of ['import', 'openGov']) {
      reportConnectionStatusToWindow(windowId, false);
    }

    // Disconnect from chains.
    for (const chainId of ['Polkadot', 'Kusama', 'Westend'] as ChainID[]) {
      await APIsController.close(chainId);
    }
  };

  /// Handle switching to online mode.
  const handleInitializeAppOnline = async () => {
    // Return if app is already initializing online mode.
    if (RendererConfig.switchingToOnlineMode) {
      return;
    }

    let aborted = false;
    let intervalRunning = true;

    // Start an interval to check if the abort flag has been set.
    const intervalId = setInterval(() => {
      if (RendererConfig.abortConnecting) {
        // Reset abort connecting flag.
        RendererConfig.abortConnecting = false;

        // Set flag to stop processing this function.
        aborted = true;

        // Stop this interval.
        clearInterval(intervalId);
        intervalRunning = false;
      }
    }, 1000);

    // Report online status to renderer.
    !aborted &&
      setOnline(
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false
      );

    // Set config flag to `true` to make sure the app doesn't re-execute
    // this function's logic whilst the connection status is online.
    RendererConfig.switchingToOnlineMode = true;

    // Connect required API instances before continuing.
    const chainIds = Array.from(AccountsController.accounts.keys());
    await Promise.all(
      chainIds.map((cid) => APIsController.connectInstance(cid))
    );

    // Fetch up-to-date account data.
    if (!aborted) {
      await Promise.all([
        // Fetch account nonce and balance.
        fetchAccountBalances(),
        // Use API instance to initialize account nomination pool data.
        fetchAccountNominationPoolData(),
        // Initialize account nominating data.
        fetchAccountNominatingData(),
      ]);
    }

    // Re-subscribe account and chain tasks.
    if (!aborted) {
      await Promise.all([
        AccountsController.subscribeAccounts(),
        SubscriptionsController.resubscribeChains(),
      ]);
    }

    // Initialise intervals controller and interval subscriptions.
    if (!aborted) {
      await IntervalsController.initIntervals(true);
    }

    // Disconnect from any API instances that are not currently needed.
    await handleApiDisconnects();

    // Set application state.
    setSubscriptionsAndChainConnections();

    // Notify import renderer of connection status.
    if (!aborted) {
      for (const windowId of ['import', 'openGov']) {
        reportConnectionStatusToWindow(windowId, true);
      }
    }

    // Set config flag to false.
    RendererConfig.switchingToOnlineMode = false;

    // Stop abort checking interval.
    intervalRunning && clearInterval(intervalId);

    // Set app in offline mode if connection processing was aborted.
    if (aborted) {
      await handleInitializeAppOffline();
      setIsAborting(false);
    }
  };

  /// Re-subscribe to tasks when switching to a different endpoint.
  const handleNewEndpointForChain = async (
    chainId: ChainID,
    newEndpoint: string
  ) => {
    const currentStatus = APIsController.getStatus(chainId);

    if (currentStatus === 'disconnected') {
      // Set new endpoint.
      APIsController.setEndpointForApi(chainId, newEndpoint);
    } else {
      // Disconnect from chain and set new endpoint.
      await APIsController.close(chainId);
      APIsController.setEndpointForApi(chainId, newEndpoint);

      // Connect to new endpoint.
      await APIsController.connectInstance(chainId);

      // Re-subscribe account and chain tasks.
      await Promise.all([
        AccountsController.subscribeAccountsForChain(chainId),
        SubscriptionsController.resubscribeChain(chainId),
      ]);
    }

    // Set application state.
    setSubscriptionsAndChainConnections();
  };

  /// Utility.
  const initIntervalsController = async (isOnline: boolean) => {
    const ipcTask: IpcTask = { action: 'interval:task:get', data: null };
    const serialized = (await window.myAPI.sendIntervalTask(ipcTask)) || '[]';
    const tasks: IntervalSubscription[] = JSON.parse(serialized);

    // Insert subscriptions and start interval if online.
    IntervalsController.insertSubscriptions(tasks, isOnline);

    // Add tasks to React state in main window.
    // When the OpenGov view is open, the task state is synced in a separate function.
    for (const task of tasks) {
      addIntervalSubscription({ ...task });
    }
  };

  const setSubscriptionsAndChainConnections = () => {
    // Set chain subscriptions data for rendering.
    setChainSubscriptions(SubscriptionsController.getChainSubscriptions());

    // Set account subscriptions data for rendering.
    setAccountSubscriptions(
      SubscriptionsController.getAccountSubscriptions(
        AccountsController.accounts
      )
    );

    // Report chain connections to UI.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }
  };

  /// Report connection status to import renderer.
  const reportConnectionStatusToWindow = (
    windowId: string,
    status: boolean
  ) => {
    switch (windowId) {
      case 'import': {
        RendererConfig.portToImport?.postMessage({
          task: 'import:connection:status',
          data: { status },
        });
        break;
      }
      case 'openGov': {
        RendererConfig.portToOpenGov?.postMessage({
          task: 'openGov:connection:status',
          data: { status },
        });
        break;
      }
    }
  };

  /// Called when initializing a new port pair.
  const reportCurrentConnectionStatusToWIndow = async (windowId: string) => {
    const status: boolean =
      (await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:getStatus',
        data: null,
      })) || false;

    switch (windowId) {
      case 'import': {
        RendererConfig.portToImport?.postMessage({
          task: 'import:connection:status',
          data: { status },
        });

        break;
      }
      case 'openGov': {
        RendererConfig.portToOpenGov?.postMessage({
          task: 'openGov:connection:status',
          data: { status },
        });

        break;
      }
    }
  };

  /// Called when initializing the openGov window.
  const syncOpenGovWindow = async () => {
    await reportCurrentConnectionStatusToWIndow('openGov');

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

  /// Called when initializing the accounts window.
  const syncImportWindow = async () => {
    await reportCurrentConnectionStatusToWIndow('import');
  };

  return (
    <BootstrappingContext.Provider
      value={{
        appLoading,
        isAborting,
        isConnecting,
        online,
        setAppLoading,
        setIsAborting,
        setIsConnecting,
        setOnline,
        handleInitializeApp,
        handleInitializeAppOffline,
        handleInitializeAppOnline,
        handleNewEndpointForChain,
        syncImportWindow,
        syncOpenGovWindow,
      }}
    >
      {children}
    </BootstrappingContext.Provider>
  );
};
