// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainInterfaceWrapper } from '@app/Wrappers';
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
import { ConfigRenderer } from '@/config/ConfigRenderer';
import type { AnyJson } from '@/types/misc';
import type { FlattenedAccounts } from '@/types/accounts';
import type { IpcRendererEvent } from 'electron';

import * as AccountUtils from '@/utils/AccountUtils';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { ChainList } from '@/config/chains';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { fetchNominationPoolDataForAccount } from '@/utils/AccountUtils';
import { useChains } from './contexts/Chains';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { setAddresses, importAddress, removeAddress } = useAddresses();

  const { setChainSubscriptions, setAccountSubscriptions } = useSubscriptions();
  const { setRenderedSubscriptions } = useManage();
  const { setOnline } = useOnlineStatus();
  const { addChain } = useChains();

  const refAppInitialized = useRef(false);

  useEffect(() => {
    const handlePorts = () => {
      // Handle port communication.
      window.onmessage = (e: MessageEvent) => {
        switch (e.data.target) {
          case 'main': {
            // Cache main port on renderer config.
            ConfigRenderer.portMain = e.ports[0];

            // Receive data from `import` port.
            ConfigRenderer.portMain.onmessage = async (ev: MessageEvent) => {
              switch (ev.data.task) {
                // Import an address received from the `import` window.
                case 'address:import': {
                  console.log('> Executing address:import');
                  const { chainId, source, address, name } = ev.data.data;

                  // Add address to accounts controller.
                  const account = AccountsController.add(
                    chainId,
                    source,
                    address,
                    name
                  );

                  // If account was unsuccessfully added, exit early.
                  if (!account) {
                    console.log(
                      'Account could not be added, probably already added'
                    );
                    return;
                  }

                  // Initialize nomination pool data for account if necessary.
                  await fetchNominationPoolDataForAccount(account, chainId);

                  // Add account to address context state.
                  importAddress(chainId, source, address, name);

                  // Update account subscriptions data.
                  setAccountSubscriptions(
                    SubscriptionsController.getAccountSubscriptions(
                      AccountsController.accounts
                    )
                  );

                  break;
                }
                case 'address:remove': {
                  console.log('> Executing address:remove');
                  const { address, chainId } = ev.data.data;

                  // Retrieve the account.
                  const account = AccountsController.get(chainId, address);

                  if (!account) {
                    console.log(
                      'Account could not be added, probably already added'
                    );
                    return;
                  }

                  // Unsubscribe from all active tasks.
                  await AccountsController.removeAllSubscriptions(account);

                  // Remove account from controller and store.
                  AccountsController.remove(chainId, address);

                  // Remove address from context.
                  removeAddress(chainId, address);

                  // Update account subscriptions data.
                  setAccountSubscriptions(
                    SubscriptionsController.getAccountSubscriptions(
                      AccountsController.accounts
                    )
                  );

                  // Report chain connections to UI.
                  for (const apiData of APIsController.getAllFlattenedAPIData()) {
                    addChain(apiData);
                  }

                  // Transition away from rendering toggles.
                  setRenderedSubscriptions({ type: '', tasks: [] });

                  break;
                }
                default: {
                  throw new Error(`Port task not recognized (${ev.data.task})`);
                }
              }
            };

            // Start receiving messages from import port.
            ConfigRenderer.portMain.start();

            break;
          }
          case 'import': {
            // Cache import port on renderer config.
            ConfigRenderer.portImport = e.ports[0];

            // Receive data from `main` port.
            ConfigRenderer.portImport.onmessage = (ev: MessageEvent) => {
              console.log('> TODO: Data received from main renderer:');
              console.log(ev.data);
            };

            // Start receiving messages from main port.
            ConfigRenderer.portImport.start();

            break;
          }
          default: {
            console.error('Something went wrong.');
            break;
          }
        }
      };
    };

    handlePorts();

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

        // Set accounts to render.
        setAddresses(AccountsController.accounts);

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

      // Report chain connections to UI.
      for (const apiData of APIsController.getAllFlattenedAPIData()) {
        addChain(apiData);
      }
    });

    // Handle initial responses to populate state from store.
    window.myAPI.reportImportedAccounts(
      (_: IpcRendererEvent, accounts: string) => {
        const parsed: FlattenedAccounts = new Map(JSON.parse(accounts));
        setAddresses(parsed);
        setRenderedSubscriptions({ type: '', tasks: [] });
      }
    );

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
