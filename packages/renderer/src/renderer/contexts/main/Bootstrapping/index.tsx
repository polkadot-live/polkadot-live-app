// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as AccountUtils from '@ren/utils/AccountUtils';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defaultBootstrappingContext } from './default';
import { AccountsController } from '@ren/controller/AccountsController';
import { APIsController } from '@ren/controller/APIsController';
import { Config as RendererConfig } from '@ren/config/processes/renderer';
import { ChainList } from '@ren/config/chains';
import { SubscriptionsController } from '@ren/controller/SubscriptionsController';
import { IntervalsController } from '@ren/controller/IntervalsController';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useChains } from '@app/contexts/main/Chains';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { disconnectAPIs } from '@ren/utils/ApiUtils';
import type { BootstrappingInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { AnyData } from '@polkadot-live/types/misc';

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
  const initChainAPIs = () =>
    APIsController.initialize(Array.from(ChainList.keys()));

  /// Step 2: Initialize accounts.
  const initAccounts = async () => await AccountsController.initialize();

  /// Step 3: Connect necessary API instances.
  const connectAPIs = async () => {
    const chainIds = Array.from(AccountsController.accounts.keys());
    await Promise.all(chainIds.map((c) => APIsController.connectApi(c)));
  };

  /// Step 4: Fetch current account data.
  const fetchAccountData = async () =>
    await Promise.all([
      AccountUtils.fetchAccountBalances(),
      AccountUtils.fetchAccountNominationPoolData(),
      AccountUtils.fetchAccountNominatingData(),
    ]);

  /// Step 5: Initiate subscriptions.
  const initSubscriptions = async () => {
    await Promise.all([
      AccountsController.subscribeAccounts(),
      SubscriptionsController.initChainSubscriptions(),
    ]);
  };

  /// Util: Get connection status.
  const getOnlineStatus = async () =>
    (await window.myAPI.sendConnectionTaskAsync({
      action: 'connection:getStatus',
      data: null,
    })) || false;

  /// Handle event listeners.
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      initChainAPIs();

      // Initialise online status controller and set online state.
      await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:init',
        data: null,
      });

      const isConnected: boolean = await getOnlineStatus();
      window.myAPI.relayModeFlag('isOnlineMode', isConnected);
      window.myAPI.relayModeFlag('isConnected', isConnected);

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
        } else if (!refAborted.current && isConnected) {
          await task();
        }
      }

      // Set application state.
      setAddresses(AccountsController.getAllFlattenedAccountData());
      setSubscriptionsAndChainConnections();
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
    window.myAPI.relayModeFlag('isOnlineMode', false);
    window.myAPI.relayModeFlag('isConnected', await getOnlineStatus());

    // Disconnect from chains.
    for (const chainId of ['Polkadot', 'Kusama', 'Westend'] as ChainID[]) {
      await APIsController.close(chainId);
    }
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

    setSubscriptionsAndChainConnections(); // Set application state.
    refSwitchingToOnline.current = false;

    if (refAborted.current) {
      refAborted.current = false;
      setIsAborting(false);
      await handleInitializeAppOffline();
    } else {
      // Report online status to renderers.
      const status = await getOnlineStatus();
      window.myAPI.relayModeFlag('isOnlineMode', status);
      window.myAPI.relayModeFlag('isConnected', status);
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
  const initIntervalsController = async () => {
    const isOnline: boolean =
      (await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:getStatus',
        data: null,
      })) || false;

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
