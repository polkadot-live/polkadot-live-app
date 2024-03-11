// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { ConfigRenderer } from '@/config/ConfigRenderer';
import { fetchNominationPoolDataForAccount } from '@/utils/AccountUtils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { useEffect } from 'react';
import { useAddresses } from '@app/contexts/Addresses';
import { useChains } from '@app/contexts/Chains';
import { useManage } from '@app/screens/Home/Manage/provider';
import { useSubscriptions } from '@app/contexts/Subscriptions';

export const useMessagePorts = () => {
  const { importAddress, removeAddress } = useAddresses();
  const { setAccountSubscriptions } = useSubscriptions();
  const { addChain } = useChains();
  const { setRenderedSubscriptions } = useManage();

  useEffect(() => {
    /**
     * @name handleImportAddress
     * @summary Imports a new account when a message is received from import window.
     * Handled in the main window.
     */
    const handleImportAddress = async (ev: MessageEvent) => {
      const { chainId, source, address, name } = ev.data.data;

      // Add address to accounts controller.
      const account = AccountsController.add(chainId, source, address, name);

      if (!account) {
        // Account could not be added, probably already added.
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
    };

    /**
     * @name handleRemoveAddress
     * @summary Removes an account a message is received from import window.
     * Handled in the main window.
     */
    const handleRemoveAddress = async (ev: MessageEvent) => {
      const { address, chainId } = ev.data.data;

      // Retrieve the account.
      const account = AccountsController.get(chainId, address);

      if (!account) {
        console.log('Account could not be added, probably already added');
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
    };

    /**
     * Determines whether the received port is for the `main` or `import` window and
     * sets up message handlers accordingly.
     */
    window.onmessage = (e: MessageEvent) => {
      switch (e.data.target) {
        case 'main': {
          ConfigRenderer.portMain = e.ports[0];

          ConfigRenderer.portMain.onmessage = async (ev: MessageEvent) => {
            switch (ev.data.task) {
              case 'address:import': {
                await handleImportAddress(ev);
                break;
              }
              case 'address:remove': {
                await handleRemoveAddress(ev);
                break;
              }
              default: {
                throw new Error(`Port task not recognized (${ev.data.task})`);
              }
            }
          };

          ConfigRenderer.portMain.start();
          break;
        }
        case 'import': {
          ConfigRenderer.portImport = e.ports[0];

          ConfigRenderer.portImport.onmessage = (ev: MessageEvent) => {
            console.log(ev.data);
          };

          ConfigRenderer.portImport.start();
          break;
        }
        default: {
          console.error('Something went wrong.');
          break;
        }
      }
    };
  }, []);
};
