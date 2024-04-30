// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defaultOnlineStatusContext } from './default';
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
import { useAddresses } from '../Addresses';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { OnlineStatusInterface } from './types';
import { handleApiDisconnects } from '@/utils/ApiUtils';
import { useSubscriptions } from '../Subscriptions';
import { useChains } from '../Chains';
import type { ChainID } from '@/types/chains';

export const OnlineStatusContext = createContext<OnlineStatusInterface>(
  defaultOnlineStatusContext
);

export const useOnlineStatus = () => useContext(OnlineStatusContext);

export const OnlineStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // App loading flag.
  const [appLoading, setAppLoading] = useState(true);
  const [online, setOnline] = useState<boolean>(false);

  const { addChain } = useChains();
  const { setAddresses } = useAddresses();
  const { setChainSubscriptions, setAccountSubscriptions } = useSubscriptions();

  const refAppInitialized = useRef(false);

  /// Notify main process there may be a change in connection status.
  const handleOnline = () => {
    window.myAPI.handleConnectionStatus();
  };

  /// Notify main process there may be a change in connection status.
  const handleOffline = () => {
    window.myAPI.handleConnectionStatus();
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
      // Initialise online status controller and set online state.
      await window.myAPI.initOnlineStatus();
      const isOnline = await window.myAPI.getOnlineStatus();
      setOnline(isOnline);

      // Initialize accounts from persisted state.
      await AccountsController.initialize();

      // Initialize chain APIs.
      await APIsController.initialize(Array.from(ChainList.keys()));

      if (isOnline) {
        // Fetch account nonce and balance.
        await fetchAccountBalances();

        // Use API instance to initialize account nomination pool data.
        await fetchAccountNominationPoolData();

        // Initialize account nominating data.
        await fetchAccountNominatingData();
      }

      // Initialize persisted account subscriptions.
      await AccountsController.subscribeAccounts();

      // Initialize persisted chain subscriptions.
      await SubscriptionsController.initChainSubscriptions();

      // Set accounts to render.
      setAddresses(AccountsController.getAllFlattenedAccountData());

      // Disconnect from any API instances that are not currently needed.
      if (isOnline) {
        await handleApiDisconnects();
      }

      // Set application state.
      setSubscriptionsAndChainConnections();

      refAppInitialized.current = true;

      // Wait 1.5 seconds to avoid a snapping loading spinner.
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

    // Re-initialize accounts controller.
    await AccountsController.initialize();

    // Report online status to renderer.
    setOnline(false);

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
      console.log('>> set interval...');

      if (RendererConfig.abortConnecting) {
        // Set flag to stop processing this function.
        aborted = true;

        // Reset abort connecting flag.
        RendererConfig.abortConnecting = false;

        // Stop this interval.
        clearInterval(intervalId);
        intervalRunning = false;
      }
    }, 1000);

    // Report online status to renderer.
    setOnline(await window.myAPI.getOnlineStatus());

    // Set config flag to `true` to make sure the app doesn't re-execute
    // this function's logic whilst the connection status is online.
    RendererConfig.switchingToOnlineMode = true;

    // Fetch account nonce and balance.
    !aborted && (await fetchAccountBalances());

    // Fetch up-to-date nomination pool data for managed accounts.
    !aborted && (await fetchAccountNominationPoolData());

    // Fetch up-to-data nominating data for managed accounts.
    !aborted && (await fetchAccountNominatingData());

    // Re-subscribe to managed accounts cached subscription tasks.
    !aborted && (await AccountsController.subscribeAccounts());

    // Re-subscribe to managed chain subscription tasks.
    !aborted && (await SubscriptionsController.resubscribeAccounts());

    // Set application state.
    !aborted && setSubscriptionsAndChainConnections();

    // Set config flag to false.
    RendererConfig.switchingToOnlineMode = false;

    // Stop abort checking interval.
    intervalRunning && clearInterval(intervalId);

    // Set app in offline mode if connection processing was aborted.
    aborted && (await handleInitializeAppOffline());
  };

  /// Utility.
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

  return (
    <OnlineStatusContext.Provider
      value={{
        appLoading,
        online,
        setAppLoading,
        setOnline,
        handleInitializeApp,
        handleInitializeAppOffline,
        handleInitializeAppOnline,
      }}
    >
      {children}
    </OnlineStatusContext.Provider>
  );
};
