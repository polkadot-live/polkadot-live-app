// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@ren/config/processes/import';
import { chainIcon } from '@ren/config/chains';
import { createContext, useContext, useState } from 'react';
import type { WalletConnectImportContextInterface } from './types';
import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

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

  return (
    <WalletConnectImportContext.Provider
      value={{
        wcFetchedAddresses,
        wcNetworks,
        handleConnect,
        handleDisconnect,
        handleFetch,
        setWcNetworks,
        setWcFetchedAddresses,
      }}
    >
      {children}
    </WalletConnectImportContext.Provider>
  );
};
