// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';

/// Import window contexts.
import { useAddresses as useImportAddresses } from '@app/contexts/import/Addresses';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useConnections } from '@app/contexts/import/Connections';
import { useEffect } from 'react';

export const useImportMessagePorts = () => {
  const { importAccountJson } = useImportAddresses();
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

        ConfigImport.portImport.onmessage = (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
            case 'import:account:add': {
              importAccountJson(ev.data.data.json);
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
