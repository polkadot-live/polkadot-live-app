// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { chainIcon } from '@ren/config/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  WalletConnectContextInterface,
  WcFetchedAddress,
  WcSelectNetwork,
} from './types';
import { encodeAddress } from '@polkadot/util-crypto';
import type { ChainID } from '@polkadot-live/types/chains';

const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
const WC_RELAY_URL = 'wss://relay.walletconnect.com';

const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

const mapCaipChainId = new Map<string, ChainID>([
  [WC_POLKADOT_CAIP_ID, 'Polkadot'],
  [WC_KUSAMA_CAIP_ID, 'Kusama'],
  [WC_WESTEND_CAIP_ID, 'Westend'],
]);

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
  const [wcConnecting, setWcConnecting] = useState(false);
  const [wcInitialized, setWcInitialized] = useState(false);

  const wcProvider = useRef<UniversalProvider | null>(null);
  const wcModal = useRef<WalletConnectModal | null>(null);

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
   * Get namespaces of selected networks.
   */
  const getNamespaces = () =>
    wcNetworks
      .filter(({ selected }) => selected)
      .map(({ caipId }) => `polkadot:${caipId}`);

  /**
   * Util for getting a chain ID's address prefix for encoding.
   */
  const getAddressPrefix = (chainId: ChainID) => {
    switch (chainId) {
      case 'Polkadot': {
        return 0;
      }
      case 'Kusama': {
        return 2;
      }
      case 'Westend': {
        return 42;
      }
    }
  };

  /**
   * Init provider.
   */
  const initProvider = async () => {
    if (wcProvider.current === null) {
      // Instantiate provider.
      const provider = await UniversalProvider.init({
        projectId: WC_PROJECT_ID,
        relayUrl: WC_RELAY_URL,
        // TODO: metadata
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

      wcProvider.current = provider;
    }

    if (!wcModal.current === null) {
      // Create a standalone modal using the dapp's WalletConnect projectId.
      const modal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: WC_PROJECT_ID,
      });

      wcModal.current = modal;
    }

    setWcInitialized(true);
  };

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
      // Set connecting flag.
      setWcConnecting(true);

      const params = getConnectionParams();
      const { uri, approval } =
        await wcProvider.current!.client.connect(params);

      // Open the modal prompting the user to scan the QR code with their wallet app or copy
      // the URI from the modal and paste into their wallet app to begin the session creation
      // process.
      if (uri) {
        wcModal.current!.openModal({ uri });
      }

      setWcConnecting(false);

      // Await session approval from the wallet app.
      // expiry: timestamp of session expiry
      // pairingTopic: ID of pairing, attempt to connect if cached.
      // await client.connect({ pairingTopic, requiredNamespaces });
      const walletConnectSession = await approval();

      wcModal.current!.closeModal();

      // Get the accounts from the session for use in constructing transactions.
      const wcAccounts = Object.values(walletConnectSession.namespaces)
        .map((namespace) => namespace.accounts)
        .flat();

      // Grab account addresses and their CAIP ID.
      const accounts: { address: string; caipId: string }[] = wcAccounts.map(
        (wcAccount) => ({
          address: wcAccount.split(':')[2],
          caipId: wcAccount.split(':')[1],
        })
      );

      // Set received WalletConnect address state.
      setWcFetchedAddresses(() =>
        accounts.map(({ address, caipId }) => {
          const chainId = mapCaipChainId.get(caipId)!;
          const pref = getAddressPrefix(chainId);

          return {
            chainId,
            encoded: encodeAddress(address, pref),
            substrate: address,
            selected: false,
          };
        })
      );
    } catch (error: AnyData) {
      console.error('initWc: An unexpected error occurred:', error);
    }
  };

  /**
   * Initialize the WalletConnect provider on initial render.
   */
  useEffect(() => {
    if (!wcProvider.current) {
      initProvider();
    }
  }, []);

  return (
    <WalletConnectContext.Provider
      value={{
        initWc,
        wcFetchedAddresses,
        setWcFetchedAddresses,
        wcNetworks,
        setWcNetworks,
        wcConnecting,
        wcInitialized,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};
