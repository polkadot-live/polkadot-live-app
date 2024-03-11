// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { ChainList } from '@/config/chains';
import { fetchAccountNominationPoolData } from '@/utils/AccountUtils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { useAddresses } from '@app/contexts/Addresses';
import { useChains } from '@app/contexts/Chains';
import { useEffect, useRef } from 'react';
import { useOnlineStatus } from '@app/contexts/OnlineStatus';
import { useSubscriptions } from '@app/contexts/Subscriptions';

export const useInitIpcHandlers = () => {
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
        // Initialize accounts from persisted state.
        await AccountsController.initialize();

        // Initialize chain APIs.
        await APIsController.initialize(Array.from(ChainList.keys()));

        // Use API instance to initialize account nomination pool data.
        if (await window.myAPI.getOnlineStatus()) {
          await fetchAccountNominationPoolData();
        }

        // Initialize persisted account subscriptions.
        await AccountsController.subscribeAccounts();

        // Initialize persisted chain subscriptions.
        await SubscriptionsController.initChainSubscriptions();

        // Set accounts to render.
        setAddresses(AccountsController.accounts);

        // Set application state.
        setSubscriptionsAndChainConnections();

        refAppInitialized.current = true;

        console.log('App initialized...');
      }
    });

    /**
     * Handle switching to offline mode.
     */
    window.myAPI.initializeAppOffline(async () => {
      // Unsubscribe queryMulti API calls for managed accounts.
      AccountsController.unsubscribeAccounts();

      // Unsubscribe queryMulti API calls for managed chains.
      SubscriptionsController.unsubscribeChains();

      // Disconnect from any active API instances.
      for (const chainId of Array.from(ChainList.keys())) {
        await APIsController.close(chainId);
      }

      // Report online status to renderer.
      setOnline(await window.myAPI.getOnlineStatus());
    });

    /**
     * Handle switching to online mode.
     */
    window.myAPI.initializeAppOnline(async () => {
      // Fetch up-to-date nomination pool data for managed accounts.
      await fetchAccountNominationPoolData();

      // Re-subscribe to managed accounts cached subscription tasks.
      await AccountsController.resubscribeAccounts();

      // Re-subscribe to managed chain subscription tasks.
      await SubscriptionsController.resubscribeAccounts();

      // Report online status to renderer.
      setOnline(await window.myAPI.getOnlineStatus());

      // Set application state.
      setSubscriptionsAndChainConnections();
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
};