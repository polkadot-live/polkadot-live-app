// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@ren/config/processes/import';
import { chainIcon } from '@ren/config/chains';
import { createContext, useContext, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import type { WalletConnectImportContextInterface } from './types';
import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useImportHandler } from '@app/contexts/import/ImportHandler';

// TODO: Move constants and network array to config file.
const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

export const WalletConnectImportContext =
  createContext<WalletConnectImportContextInterface>(
    defaults.defaultWalletConnectImportContext
  );

export const useWalletConnectImport = () =>
  useContext(WalletConnectImportContext);

export const WalletConnectImportProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { insertAccountStatus } = useAccountStatuses();
  const { isAlreadyImported } = useAddresses();
  const { handleImportAddress } = useImportHandler();

  const [isImporting, setIsImporting] = useState(false);

  /**
   * WalletConnect networks and their selected state.
   */
  const [wcNetworks, setWcNetworks] = useState<WcSelectNetwork[]>([
    {
      caipId: WC_POLKADOT_CAIP_ID,
      ChainIcon: chainIcon('Polkadot'),
      chainId: 'Polkadot',
      selected: false,
    },
    {
      caipId: WC_KUSAMA_CAIP_ID,
      ChainIcon: chainIcon('Kusama'),
      chainId: 'Kusama',
      selected: false,
    },
    {
      caipId: WC_WESTEND_CAIP_ID,
      ChainIcon: chainIcon('Westend'),
      chainId: 'Westend',
      selected: false,
    },
  ]);

  /**
   * Fetched addresses with WalletConnect.
   */
  const [wcFetchedAddresses, setWcFetchedAddresses] = useState<
    WcFetchedAddress[]
  >([]);

  /**
   * Handle connect button click.
   */
  const handleConnect = async () => {
    const selectedNetworks = wcNetworks.filter(
      ({ selected }) => selected === true
    );

    ConfigImport.portImport.postMessage({
      task: 'renderer:wc:connect',
      data: { networks: JSON.stringify(selectedNetworks) },
    });
  };

  /**
   * Handle disconnect button click.
   */
  const handleDisconnect = async () => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:wc:disconnect',
      data: null,
    });
  };

  /**
   * Handle fetch button click.
   */
  const handleFetch = () => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:wc:fetch',
      data: null,
    });
  };

  /**
   * Util for getting the selected addresses to import.
   */
  const getSelectedAddresses = () =>
    wcFetchedAddresses.filter(({ selected }) => selected);

  /**
   * Handle importing the selected WalletConnect addresses.
   */
  const handleImportProcess = async (
    setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const selectedAddresses = getSelectedAddresses();
    if (selectedAddresses.length === 0) {
      return;
    }

    setIsImporting(true);
    for (const selected of selectedAddresses) {
      const { encoded } = selected;

      if (isAlreadyImported(encoded)) {
        continue;
      }

      const accountName = ellipsisFn(encoded);
      await handleImportAddress(encoded, 'wallet-connect', accountName, false);
      insertAccountStatus(encoded, 'wallet-connect');
    }

    setIsImporting(false);
    setShowImportUi(false);

    // Clear selected WalletAccount addresses.
    setWcFetchedAddresses((prev) =>
      prev.map((item) => ({ ...item, selected: false }))
    );
  };

  return (
    <WalletConnectImportContext.Provider
      value={{
        isImporting,
        wcFetchedAddresses,
        wcNetworks,
        getSelectedAddresses,
        handleConnect,
        handleDisconnect,
        handleFetch,
        handleImportProcess,
        setWcNetworks,
        setWcFetchedAddresses,
      }}
    >
      {children}
    </WalletConnectImportContext.Provider>
  );
};
