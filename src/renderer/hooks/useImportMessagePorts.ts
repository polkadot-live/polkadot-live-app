// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';

/// Import window contexts.
import { useImportHandler } from '@app/contexts/import/ImportHandler';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useConnections } from '@/renderer/contexts/common/Connections';
import { useEffect } from 'react';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

export const useImportMessagePorts = () => {
  const { handleImportAddressFromBackup } = useImportHandler();
  const { setIsConnected } = useConnections();
  const { setStatusForAccount } = useAccountStatuses();

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
            case 'import:connection:status': {
              const { status } = ev.data.data;
              setIsConnected(status);
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
