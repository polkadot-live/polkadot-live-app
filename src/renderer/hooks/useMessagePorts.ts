// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { Config as ConfigAction } from '@/config/processes/action';
import { Config as ConfigImport } from '@/config/processes/import';
import { ExtrinsicsController } from '@/controller/renderer/ExtrinsicsController';
import {
  fetchAccountBalances,
  fetchNominatingDataForAccount,
  fetchNominationPoolDataForAccount,
} from '@/utils/AccountUtils';
import { handleApiDisconnects } from '@/utils/ApiUtils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { useEffect } from 'react';
import { useAddresses } from '@app/contexts/Addresses';
import { useChains } from '@app/contexts/Chains';
import { useEvents } from '../contexts/Events';
import { useManage } from '@app/screens/Home/Manage/provider';
import { useSubscriptions } from '@app/contexts/Subscriptions';
import { useTxMeta } from '../contexts/TxMeta';
import type { ActionMeta } from '@/types/tx';

export const useMessagePorts = () => {
  const { importAddress, removeAddress, setAddresses } = useAddresses();
  const { addChain } = useChains();
  const { updateEventsOnAccountRename } = useEvents();
  const { setRenderedSubscriptions } = useManage();
  const { setAccountSubscriptions, updateAccountNameInTasks } =
    useSubscriptions();

  // Action window specific.
  const {
    setActionMeta,
    setEstimatedFee,
    setTxId,
    setTxPayload,
    setGenesisHash,
    setTxStatus,
  } = useTxMeta();

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

      if (await window.myAPI.getOnlineStatus()) {
        // Fetch account nonce and balance.
        await fetchAccountBalances();

        // Initialize nomination pool data for account if necessary.
        await fetchNominationPoolDataForAccount(account, chainId);

        // Initialize nominating data for account if necessary.
        await fetchNominatingDataForAccount(account, chainId);

        // Disconnect from any API instances that are not currently needed.
        await handleApiDisconnects();
      }

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
        console.log('Account could not be fetched, probably not imported yet');
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

      // Disconnect from any API instances that are not currently needed.
      await handleApiDisconnects();

      // Report chain connections to UI.
      for (const apiData of APIsController.getAllFlattenedAPIData()) {
        addChain(apiData);
      }

      // Transition away from rendering toggles.
      setRenderedSubscriptions({ type: '', tasks: [] });
    };

    /**
     * @name handleRenameAccount
     * @summary Rename an account managed by the accounts controller and update state.
     */
    const handleRenameAccount = async (ev: MessageEvent) => {
      const { address, chainId, newName } = ev.data.data;
      const account = AccountsController.get(chainId, address);

      if (!account) {
        // Account not found in controller.
        console.log('account not imported');
        return;
      }

      // Set new account name and persist new account data to storage.
      account.name = newName;
      await AccountsController.set(chainId, account);

      // Update account react state.
      setAddresses(AccountsController.getAllFlattenedAccountData());

      // Update subscription task react state.
      updateAccountNameInTasks(address, newName);

      // The updated events will be sent back to the renderer for updating React state.
      const updated = await window.myAPI.updateAccountNameForEventsAndTasks(
        address,
        newName
      );

      if (updated && updated.length > 0) {
        updateEventsOnAccountRename(updated, chainId);
      }
    };

    /**
     * @name handleInitAction
     * @summary Set initial state for the action window.
     */
    const handleInitAction = (ev: MessageEvent) => {
      const data: ActionMeta = JSON.parse(ev.data.data);
      console.log(data);
      setActionMeta(data);
    };

    /**
     * @name handleActionTxInit
     * @summary Initialize extrinsics controller with tx data.
     */
    const handleActionTxInit = async (ev: MessageEvent) => {
      const { chainId, from, nonce, pallet, method, args, eventUid } =
        ev.data.data;

      await ExtrinsicsController.new(
        chainId,
        from,
        nonce,
        pallet,
        method,
        args,
        eventUid
      );
    };

    /**
     * @name handleTxReportData
     * @summary Set tx data in actions window sent from extrinsics controller.
     */
    const handleTxReportData = (ev: MessageEvent) => {
      const { estimatedFee, txId, payload, genesisHash } = ev.data.data;

      setEstimatedFee(estimatedFee);
      setTxId(txId);
      setTxPayload(txId, payload);
      setGenesisHash(genesisHash);
    };

    /**
     * @name handleTxVaultSubmit
     * @summary Set signature and submit transaction.
     */
    const handleTxVaultSubmit = (ev: MessageEvent) => {
      const { signature } = ev.data.data;

      ExtrinsicsController.setSignature(signature);
      ExtrinsicsController.submit();
    };

    /**
     * @name handleSetTxStatus
     * @summary Update the transaction status.
     */
    const handleSetTxStatus = (ev: MessageEvent) => {
      const { status } = ev.data.data;

      setTxStatus(status);
    };

    /**
     * @name handleReceivedPort
     * @summary Determines whether the received port is for the `main` or `import` window and
     * sets up message handlers accordingly.
     */
    const handleReceivedPort = (e: MessageEvent) => {
      console.log(`received port: ${e.data.target}`);

      switch (e.data.target) {
        case 'main-import:main': {
          ConfigRenderer.portToImport = e.ports[0];

          ConfigRenderer.portToImport.onmessage = async (ev: MessageEvent) => {
            // Message received from `import`.
            switch (ev.data.task) {
              case 'renderer:address:import': {
                await handleImportAddress(ev);
                break;
              }
              case 'renderer:address:remove': {
                await handleRemoveAddress(ev);
                break;
              }
              case 'renderer:address:delete': {
                await handleRemoveAddress(ev);
                break;
              }
              case 'renderer:account:rename': {
                await handleRenameAccount(ev);
                break;
              }
              default: {
                throw new Error(`Port task not recognized (${ev.data.task})`);
              }
            }
          };

          ConfigRenderer.portToImport.start();
          break;
        }
        case 'main-import:import': {
          ConfigImport.portImport = e.ports[0];

          ConfigImport.portImport.onmessage = (ev: MessageEvent) => {
            // Message received from `main`.
            console.log(ev.data);
          };

          ConfigImport.portImport.start();
          break;
        }
        case 'main-action:main': {
          ConfigRenderer.portToAction = e.ports[0];

          ConfigRenderer.portToAction.onmessage = async (ev: MessageEvent) => {
            // Message received from `action`.
            switch (ev.data.task) {
              case 'renderer:tx:init': {
                console.log('> handle renderer:tx:init');
                await handleActionTxInit(ev);
                break;
              }
              case 'renderer:tx:vault:submit': {
                console.log('> handle renderer:tx:vault:submit');
                handleTxVaultSubmit(ev);
                break;
              }
              case 'renderer:tx:reset': {
                console.log('> handle renderer:tx:reset');
                ExtrinsicsController.reset();
                break;
              }
              default: {
                throw new Error(`Port task not recognized (${ev.data.task})`);
              }
            }
          };

          ConfigRenderer.portToAction.start();
          break;
        }
        case 'main-action:action': {
          ConfigAction.portAction = e.ports[0];

          ConfigAction.portAction.onmessage = async (ev: MessageEvent) => {
            // Message received from `main`.
            switch (ev.data.task) {
              case 'action:init': {
                console.log('> handle action:init');
                handleInitAction(ev);
                break;
              }
              case 'action:tx:report:data': {
                console.log('> handle action:tx:report:data');
                handleTxReportData(ev);
                break;
              }
              case 'action:tx:report:status': {
                console.log('> handle action:tx:report:status');
                handleSetTxStatus(ev);
                break;
              }
              default: {
                throw new Error(`Port task not recognized (${ev.data.task})`);
              }
            }
          };

          ConfigAction.portAction.start();
          break;
        }
        default: {
          console.error('Something went wrong.');
          break;
        }
      }
    };

    /**
     * Provide `onmessage` function.
     */
    window.onmessage = handleReceivedPort;

    /**
     * Cleanup message listener.
     */
    return () => {
      window.removeEventListener('message', handleReceivedPort, false);
    };
  }, []);
};
