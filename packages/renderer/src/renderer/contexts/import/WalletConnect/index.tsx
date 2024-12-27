// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { createContext, useContext, useState } from 'react';
import { chainIcon } from '@ren/config/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type { WalletConnectContextInterface, WcSelectNetwork } from './types';

const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
const WC_RELAY_URL = 'wss://relay.walletconnect.com';

const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

export const WalletConnectContext =
  createContext<WalletConnectContextInterface>(
    defaults.defaultWalletConnectContext
  );

export const useWalletConnect = () => useContext(WalletConnectContext);

export const WalletConnectProvider = ({
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
   * Get namespaces of selected networks.
   */
  const getNamespaces = () =>
    wcNetworks
      .filter(({ selected }) => selected)
      .map(({ caipId }) => `polkadot:${caipId}`);

  /**
   * Get connection params for WalletConnect session.
   *
   * Requires up to 3 different chain namespaces (polkadot, kusama and westend).
   * The supported methods, chains, and events can all be defined by the dapp
   * team based on the requirements of the dapp.
   */
  const getConnectionParams = () => ({
    requiredNamespaces: {
      polkadot: {
        // Sign the relevant data (either an unsigned transaction or message) and return the signature.
        methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
        chains: getNamespaces(),
        events: ['chainChanged", "accountsChanged'],
      },
    },
  });

  /**
   * Instantiate a universal provider using the projectId.
   */
  const initWc = async () => {
    try {
      const provider = await UniversalProvider.init({
        projectId: WC_PROJECT_ID,
        relayUrl: WC_RELAY_URL,
      });

      // Listen for WalletConnect events
      provider.on('session_create', (session: AnyData) => {
        console.log('Session created:', session);
      });

      provider.on('session_update', ({ topic, params }: AnyData) => {
        console.log('Session updated:', topic, params);
      });

      provider.on('session_delete', (session: AnyData) => {
        console.log('Session deleted:', session);
      });

      provider.on('connect', (event: AnyData) => {
        console.log('Connected to Wallet:', event);
      });

      provider.on('disconnect', (event: AnyData) => {
        console.log('Wallet disconnected:', event);
      });

      const params = getConnectionParams();
      const { uri, approval } = await provider.client.connect(params);

      // Create a standalone modal using the dapp's WalletConnect projectId.
      const walletConnectModal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: WC_PROJECT_ID,
      });

      // Open the modal prompting the user to scan the QR code with their wallet app or copy
      // the URI from the modal and paste into their wallet app to begin the session creation
      // process.
      if (uri) {
        walletConnectModal.openModal({ uri });
      }

      // Await session approval from the wallet app.
      // expiry: timestamp of session expiry
      // pairingTopic: ID of pairing, attempt to connect if cached.
      // await client.connect({ pairingTopic, requiredNamespaces });
      const walletConnectSession = await approval();

      walletConnectModal.closeModal();

      // Get the accounts from the session for use in constructing transactions.
      const wcAccounts = Object.values(walletConnectSession.namespaces)
        .map((namespace) => namespace.accounts)
        .flat();

      // Grab account addresses from CAIP account formatted accounts
      const accounts = wcAccounts.map((wcAccount) => {
        const address = wcAccount.split(':')[2];
        return address;
      });

      // TODO: Set received accounts state.
      console.log(accounts);
    } catch (error: AnyData) {
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <WalletConnectContext.Provider
      value={{ initWc, wcNetworks, setWcNetworks }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};
