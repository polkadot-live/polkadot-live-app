// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { ChainList } from '@/config/chains';
import { Config as RendererConfig } from '@/config/processes/renderer';
import {
  fetchAccountBalances,
  fetchAccountNominationPoolData,
  fetchAccountNominatingData,
} from '@/utils/AccountUtils';
import { handleApiDisconnects } from '@/utils/ApiUtils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { useAddresses } from '@app/contexts/Addresses';
import { useChains } from '@app/contexts/Chains';
import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '@app/contexts/OnlineStatus';
import { useSubscriptions } from '@app/contexts/Subscriptions';
import type { ChainID } from '@/types/chains';

export const useInitIpcHandlers = () => {
  // App loading flag.
  const [appLoading, setAppLoading] = useState(true);

  const { addChain } = useChains();
  const { setAddresses } = useAddresses();
  const { setChainSubscriptions, setAccountSubscriptions } = useSubscriptions();
  const { setOnline } = useOnlineStatus();
  const refAppInitialized = useRef(false);

  useEffect(() => {
    /**
     * Handle app initialization.
     */
    window.myAPI.initializeApp(async () => {
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
    });

    /**
     * Handle switching to offline mode.
     */
    window.myAPI.initializeAppOffline(async () => {
      // Set config flag to false to re-start the online mode initialization
      // when connection status goes back online.
      RendererConfig.switchingToOnlineMode = false;

      // Disconnect from chains.
      for (const chainId of ['Polkadot', 'Kusama', 'Westend'] as ChainID[]) {
        await APIsController.close(chainId);
      }

      // Report online status to renderer.
      setOnline(await window.myAPI.getOnlineStatus());
    });

    /**
     * Handle switching to online mode.
     */
    window.myAPI.initializeAppOnline(async () => {
      // Return if app is already initializing online mode.
      if (RendererConfig.switchingToOnlineMode) {
        return;
      }

      // Set config flag to `true` to make sure the app doesn't re-execute
      // this function's logic whilst the connection status is online.
      RendererConfig.switchingToOnlineMode = true;

      // Fetch account nonce and balance.
      await fetchAccountBalances();

      // Fetch up-to-date nomination pool data for managed accounts.
      await fetchAccountNominationPoolData();

      // Fetch up-to-data nominating data for managed accounts.
      await fetchAccountNominatingData();

      // Re-subscribe to managed accounts cached subscription tasks.
      await AccountsController.resubscribeAccounts();

      // Re-subscribe to managed chain subscription tasks.
      await SubscriptionsController.resubscribeAccounts();

      // Report online status to renderer.
      setOnline(await window.myAPI.getOnlineStatus());

      // Set application state.
      setSubscriptionsAndChainConnections();

      // Set config flag to false.
      RendererConfig.switchingToOnlineMode = false;
    });

    // Utility
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
  }, []);

  return {
    appLoading,
  };
};
