// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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
import { useAddresses } from '../Addresses';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { BootstrappingInterface } from './types';
import { handleApiDisconnects } from '@/utils/ApiUtils';
import { useSubscriptions } from '../Subscriptions';
import { useChains } from '../Chains';
import type { ChainID } from '@/types/chains';

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
  const [online, setOnline] = useState<boolean>(false);

  // Window docked state.
  const [dockToggled, setDockToggled] = useState<boolean>(true);

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

  /// Get docked flag from storage and set state.
  useEffect(() => {
    const initDockedFlag = async () => {
      const isDocked = await window.myAPI.getDockedFlag();
      setDockToggled(isDocked);
    };

    initDockedFlag();
  }, []);

  /// Handle app initialization.
  const handleInitializeApp = async () => {
    if (!refAppInitialized.current) {
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
      await window.myAPI.initOnlineStatus();
      const isOnline = await window.myAPI.getOnlineStatus();
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
        reportConnectionStatusToImport(isOnline);
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

    // Report online status to renderer.
    setOnline(false);

    // Notify import renderer of connection status.
    reportConnectionStatusToImport(false);

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
    !aborted && setOnline(await window.myAPI.getOnlineStatus());

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

    // Disconnect from any API instances that are not currently needed.
    await handleApiDisconnects();

    // Set application state.
    setSubscriptionsAndChainConnections();

    // Notify import renderer of connection status.
    if (!aborted) {
      reportConnectionStatusToImport(true);
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

  /// Report connection status to import renderer.
  const reportConnectionStatusToImport = (status: boolean) => {
    RendererConfig.portToImport.postMessage({
      task: 'import:connection:status',
      data: { status },
    });
  };

  /// Handle toggling the docked window state.
  const handleDockedToggle = () => {
    setDockToggled((prev) => {
      const docked = !prev;
      window.myAPI.setDockedFlag(docked);
      return docked;
    });
  };

  return (
    <BootstrappingContext.Provider
      value={{
        appLoading,
        isAborting,
        isConnecting,
        online,
        dockToggled,
        handleDockedToggle,
        setAppLoading,
        setIsAborting,
        setIsConnecting,
        setOnline,
        handleInitializeApp,
        handleInitializeAppOffline,
        handleInitializeAppOnline,
      }}
    >
      {children}
    </BootstrappingContext.Provider>
  );
};
