// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@ren/config/processes/import';

/// Import window contexts.
import { useAddresses } from '@app/contexts/import/Addresses';
import { useImportHandler } from '@app/contexts/import/ImportHandler';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useWalletConnectImport } from '@app/contexts/import/WalletConnect';
import { useEffect } from 'react';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { WcFetchedAddress } from '@polkadot-live/types/walletConnect';

// TODO: Move to WalletConnect file.
const WC_EVENT_ORIGIN = 'https://verify.walletconnect.org';

export const useImportMessagePorts = () => {
  const { handleImportAddressFromBackup } = useImportHandler();
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressImport } = useAddresses();
  const { setWcFetchedAddresses } = useWalletConnectImport();

  /**
   * @name handleReceivedPort
   * @summary Handle messages sent to the import window.
   */
  const handleReceivedPort = (e: MessageEvent) => {
    // TODO: May need to handle WalletConnect messages here.
    // For now, don't do any further processing if message is from WalletConnect.
    if (e.origin === WC_EVENT_ORIGIN) {
      console.log('> WalletConnect event received:');
      console.log(e);
      return;
    }

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
              const { address, source, status } = ev.data.data;
              setStatusForAccount(address, source, status);
              break;
            }
            case 'import:address:update': {
              // Update state for an address.
              const { address, source } = ev.data.data;
              handleAddressImport(source, address);
              break;
            }
            case 'import:wc:set:fetchedAddresses': {
              const parsed: WcFetchedAddress[] = JSON.parse(
                ev.data.data.fetchedAddresses
              );
              setWcFetchedAddresses(parsed);
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
