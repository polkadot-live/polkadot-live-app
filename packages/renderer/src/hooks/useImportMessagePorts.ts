// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';

/// Import window contexts.
import {
  useAccountStatuses,
  useAddresses,
  useImportHandler,
  useRemoveHandler,
  useWalletConnectImport,
} from '@ren/contexts/import';
import { useEffect } from 'react';
import { renderToast } from '@polkadot-live/ui/utils';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { WcFetchedAddress } from '@polkadot-live/types/walletConnect';

export const useImportMessagePorts = () => {
  const { handleImportAddressFromBackup } = useImportHandler();
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressImport } = useAddresses();
  const { handleRemoveAddress } = useRemoveHandler();
  const { setWcFetchedAddresses, handleOpenCloseWcModal } =
    useWalletConnectImport();

  /**
   * @name handleReceivedPort
   * @summary Handle messages sent to the import window.
   */
  const handleReceivedPort = (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-import:import': {
        ConfigImport.portImport = e.ports[0];

        ConfigImport.portImport.onmessage = async (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
            case 'import:account:add': {
              // Import an address from a backup file.
              const { json, source }: { json: string; source: AccountSource } =
                ev.data.data;

              const parsed =
                source === 'ledger'
                  ? (JSON.parse(json) as LedgerLocalAddress)
                  : (JSON.parse(json) as LocalAddress);

              await handleImportAddressFromBackup(parsed, source);
              break;
            }
            case 'import:account:processing': {
              const { address, source, status, success } = ev.data.data;
              setStatusForAccount(address, source, status);

              console.log(`> import:account:processing`);
              console.log(ev.data);

              if (!success) {
                const { accountName } = ev.data.data;
                await handleRemoveAddress(address, source, accountName);
                renderToast('Account import error', 'import-error', 'error');
              }
              break;
            }
            case 'import:address:update': {
              // Update state for an address.
              const { address, source } = ev.data.data;
              handleAddressImport(source, address);
              break;
            }
            case 'import:wc:modal:open': {
              const { uri } = ev.data.data;
              await handleOpenCloseWcModal(true, uri);
              break;
            }
            case 'import:wc:modal:close': {
              handleOpenCloseWcModal(false);
              break;
            }
            case 'import:wc:set:fetchedAddresses': {
              const parsed: WcFetchedAddress[] = JSON.parse(
                ev.data.data.fetchedAddresses
              );
              setWcFetchedAddresses(parsed);
              break;
            }
            case 'import:toast:show': {
              const { message, toastId, toastType } = ev.data.data;
              renderToast(message, toastId, toastType);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigImport.portImport.start();
        break;
      }
      default: {
        console.error('Something went wrong.');
        break;
      }
    }
  };

  useEffect(() => {
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
