// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainInterfaceWrapper } from '@app/Wrappers';
//import { useAccountState } from '@app/contexts/AccountState';
import { Overlay } from '@app/library/Overlay';
import { Tooltip } from '@app/library/Tooltip';
import { useEffect, useRef } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Action } from '@app/screens/Action';
import { Home } from '@app/screens/Home';
import { Import } from '@app/screens/Import';
import { useAddresses } from '@app/contexts/Addresses';
import { useOnlineStatus } from './contexts/OnlineStatus';
import { useManage } from '@app/screens/Home/Manage/provider';
import { useSubscriptions } from './contexts/Subscriptions';
import { useTheme } from 'styled-components';
import type { AnyJson } from '@/types/misc';
import type { FlattenedAccounts } from '@/types/accounts';
import type { IpcRendererEvent } from 'electron';

import * as AccountUtils from '@/utils/AccountUtils';
import { AccountsController } from './static/AccountsController';
import { APIsController } from './static/APIsController';
import { ChainList } from '@/config/chains';
import { SubscriptionsController } from './static/SubscriptionsController';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { setAddresses } = useAddresses();
  //const { setAccountStateKey } = useAccountState();

  const { setChainSubscriptions, setAccountSubscriptions } = useSubscriptions();
  const { setRenderedSubscriptions } = useManage();
  const { setOnline } = useOnlineStatus();

  const refAppInitialized = useRef(false);

  useEffect(() => {
    // Handle app initialization.
    window.myAPI.initializeApp(async () => {
      if (!refAppInitialized.current) {
        // Initialize accounts from persisted state.
        await AccountsController.initialize();

        // Initialize chain APIs.
        await APIsController.initialize(Array.from(ChainList.keys()));

        // Use API instance to initialize account nomination pool data.
        if (await window.myAPI.getOnlineStatus()) {
          await AccountUtils.fetchAccountNominationPoolData();
        }

        // Initialize persisted account subscriptions.
        await AccountsController.subscribeAccounts();

        // Initialize persisted chain subscriptions.
        await SubscriptionsController.initChainSubscriptions();

        // Set chain subscriptions data for rendering.
        setChainSubscriptions(SubscriptionsController.getChainSubscriptions());

        // Set account subscriptions data for rendering.
        setAccountSubscriptions(
          SubscriptionsController.getAccountSubscriptions(
            AccountsController.accounts
          )
        );

        refAppInitialized.current = true;
        console.log('App initialized...');
      }
      console.log('App already initialized...');
    });

    // Handle switching to online mode.
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

    // Handle switching to online mode.
    window.myAPI.initializeAppOnline(async () => {
      // Fetch up-to-date nomination pool data for managed accounts.
      await AccountUtils.fetchAccountNominationPoolData();

      // Re-subscribe to managed accounts cached subscription tasks.
      await AccountsController.resubscribeAccounts();

      // Re-subscribe to managed chain subscription tasks.
      await SubscriptionsController.resubscribeAccounts();

      // Report online status to renderer.
      setOnline(await window.myAPI.getOnlineStatus());

      // Set chain subscriptions data for rendering.
      setChainSubscriptions(SubscriptionsController.getChainSubscriptions());

      // Set account subscriptions data for rendering.
      setAccountSubscriptions(
        SubscriptionsController.getAccountSubscriptions(
          AccountsController.accounts
        )
      );
    });

    // Handle initial responses to populate state from store.
    window.myAPI.reportImportedAccounts(
      (_: IpcRendererEvent, accounts: string) => {
        const parsed: FlattenedAccounts = new Map(JSON.parse(accounts));
        setAddresses(parsed);
        setRenderedSubscriptions({ type: '', tasks: [] });
      }
    );

    //window.myAPI.reportAccountState(
    //  (
    //    _: Event,
    //    chain: ChainID,
    //    address: string,
    //    key: string,
    //    value: AnyJson
    //  ) => {
    //    setAccountStateKey(chain, address, key, value);
    //  }
    //);

    window.myAPI.reportOnlineStatus((_: IpcRendererEvent, status: boolean) => {
      console.log(`Online status STATE received: ${status}`);
      setOnline(status);
    });
  }, []);

  return (
    <MainInterfaceWrapper className={`theme-polkadot theme-${mode}`}>
      <Overlay />
      <Tooltip />
      <Routes>
        <Route path={'import'} element={<Import />} />
        <Route path={'action'} element={<Action />} />
        <Route path={'/'} element={<Home />} />
      </Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => (
  <HashRouter basename="/">
    <RouterInner />
  </HashRouter>
);
export default Router;
