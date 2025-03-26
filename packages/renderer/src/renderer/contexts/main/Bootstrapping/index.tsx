// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defaultBootstrappingContext } from './default';
import { AccountsController } from '@ren/controller/AccountsController';
import { APIsController } from '@ren/controller/APIsController';
import { Config as RendererConfig } from '@ren/config/processes/renderer';
import { ChainList } from '@ren/config/chains';
import {
  fetchAccountBalances,
  fetchAccountNominatingData,
  fetchAccountNominationPoolData,
} from '@ren/utils/AccountUtils';
import { SubscriptionsController } from '@ren/controller/SubscriptionsController';
import { IntervalsController } from '@ren/controller/IntervalsController';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useChains } from '@app/contexts/main/Chains';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { handleApiDisconnects } from '@ren/utils/ApiUtils';
import type { BootstrappingInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IpcTask } from '@polkadot-live/types/communication';

export const BootstrappingContext = createContext<BootstrappingInterface>(
  defaultBootstrappingContext
);

export const useBootstrapping = () => useContext(BootstrappingContext);

export const BootstrappingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [appLoading, setAppLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

      const isConnected: boolean =
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false;

      window.myAPI.relayModeFlag('isOnlineMode', isConnected);
      window.myAPI.relayModeFlag('isConnected', isConnected);

      // Initialize accounts from persisted state.
      await AccountsController.initialize();

      // Initialize chain APIs.
      APIsController.initialize(Array.from(ChainList.keys()));

      // Fetch up-to-date account data.
      if (isConnected && !aborted) {
        // Connect required API instances before continuing.
        await Promise.all(
          Array.from(AccountsController.accounts.keys()).map((chainId) =>
            APIsController.connectApi(chainId)
          )
        );

        await Promise.all([
          fetchAccountBalances(),
          fetchAccountNominationPoolData(),
          fetchAccountNominatingData(),
        ]);
      }

      // Initialize account and chain subscriptions.
      if (!aborted && isConnected) {
        await Promise.all([
          AccountsController.subscribeAccounts(),
          SubscriptionsController.initChainSubscriptions(),
        ]);
      }

      // Initialise intervals controller and interval subscriptions.
      await initIntervalsController(isConnected);

      // Set accounts to render.
      setAddresses(AccountsController.getAllFlattenedAccountData());

      // Disconnect from any API instances that are not currently needed.
      if (isConnected) {
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

    // Get the system's actual online connection status.
    const isConnected =
      (await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:getStatus',
        data: null,
      })) || false;

    // Report online status to renderers.
    window.myAPI.relayModeFlag('isOnlineMode', false);
    window.myAPI.relayModeFlag('isConnected', isConnected);

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

    // Set config flag to `true` to make sure the app doesn't re-execute
    // this function's logic whilst the connection status is online.
    RendererConfig.switchingToOnlineMode = true;

    // Connect required API instances before continuing.
    const chainIds = Array.from(AccountsController.accounts.keys());
    await Promise.all(chainIds.map((cid) => APIsController.connectApi(cid)));

    // Fetch up-to-date account data.
    if (!aborted) {
      await Promise.all([
        fetchAccountBalances(),
        fetchAccountNominationPoolData(),
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

    // Report online status to renderers.
    if (!aborted) {
      const status =
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false;

      window.myAPI.relayModeFlag('isOnlineMode', status);
      window.myAPI.relayModeFlag('isConnected', status);
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
      APIsController.setApiEndpoint(chainId, newEndpoint);
    } else {
      // Disconnect from chain and set new endpoint.
      await APIsController.close(chainId);
      APIsController.setApiEndpoint(chainId, newEndpoint);

      // Connect to new endpoint.
      await APIsController.connectApi(chainId);

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
