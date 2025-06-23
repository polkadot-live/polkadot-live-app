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
  EncodedAccount,
  ImportedGenericAccount,
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
              const { json }: { json: string } = ev.data.data;
              const genericAccount: ImportedGenericAccount = JSON.parse(json);
              await handleImportAddressFromBackup(genericAccount);
              break;
            }
            case 'import:account:processing': {
              const { serEncodedAccount: en, serGenericAccount: ge } =
                ev.data.data;

              const generic: ImportedGenericAccount = JSON.parse(ge);
              const encoded: EncodedAccount = JSON.parse(en);
              const { address } = encoded;

              interface I {
                source: AccountSource;
                status: boolean;
                success: boolean;
              }
              const { status, success }: I = ev.data.data;
              setStatusForAccount(address, generic.source, status);

              if (!success) {
                await handleRemoveAddress(encoded, generic);
                renderToast('Account import error', 'import-error', 'error');
              }
              break;
            }
            case 'import:address:update': {
              // Update state for an address.
              const { genericAccount } = ev.data.data;
              handleAddressImport(genericAccount);
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
