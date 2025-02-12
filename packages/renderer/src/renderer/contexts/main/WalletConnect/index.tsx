// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { createContext, useContext, useEffect, useRef } from 'react';
import { encodeAddress } from '@polkadot/util-crypto';
import { useConnections } from '@app/contexts/common/Connections';
import { getSdkError } from '@walletconnect/utils';
import { getUnixTime } from 'date-fns';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { WalletConnectContextInterface } from './types';
import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
const WC_RELAY_URL = 'wss://relay.walletconnect.com';

// TODO: Move constants and network array to config file.
const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const {
    getOnlineMode,
    isConnected,
    isOnlineMode,
    wcSyncFlags: { wcInitialized, wcSessionRestored },
  } = useConnections();

  const wcSessionRestoredRef = useRef<boolean>(false);

  const wcProvider = useRef<UniversalProvider | null>(null);
  const wcModal = useRef<WalletConnectModal | null>(null);
  const wcPairingTopic = useRef<string | null>(null);

  const wcMetaRef = useRef<{
    uri: string | undefined;
    approval: AnyData;
  } | null>(null);

  const wcInitializedRef = useRef(false);
  const wcNetworksRef = useRef<WcSelectNetwork[]>([]);

  /**
   * Get namespaces of selected networks.
   */
  const getNamespaces = () => {
    const selectedNetworks = wcNetworksRef.current.filter(
      ({ selected }) => selected
    );

    if (selectedNetworks.length > 0) {
      return wcNetworksRef.current
        .filter(({ selected }) => selected)
        .map(({ caipId }) => `polkadot:${caipId}`);
    } else {
      return [
        `polkadot:${WC_POLKADOT_CAIP_ID}`,
        `polkadot:${WC_KUSAMA_CAIP_ID}`,
      ];
    }
  };

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
   * Util for setting fetched addresses state.
   */
  const setFetchedAddresses = (namespaces: AnyData) => {
    /** Get the accounts from the session. */
    const wcAccounts = Object.values(namespaces)
      .map((namespace: AnyData) => namespace.accounts)
      .flat();

    /** Grab account addresses and their CAIP ID. */
    const accounts: { address: string; caipId: string }[] = wcAccounts.map(
      (wcAccount) => ({
        address: wcAccount.split(':')[2],
        caipId: wcAccount.split(':')[1],
      })
    );

    // Send fetched accounts to import window.
    const fetchedAddresses: WcFetchedAddress[] = accounts.map(
      ({ address, caipId }) => {
        const chainId = mapCaipChainId.get(caipId)!;
        const pref = getAddressPrefix(chainId);

        return {
          chainId,
          encoded: encodeAddress(address, pref),
          substrate: address,
          selected: false,
        };
      }
    );

    ConfigRenderer.portToImport?.postMessage({
      task: 'import:wc:set:fetchedAddresses',
      data: { fetchedAddresses: JSON.stringify(fetchedAddresses) },
    });
  };

  /**
   * Init provider and modal.
   */
  const initProvider = async () => {
    if (!wcProvider.current) {
      // Instantiate provider.
      const provider = await UniversalProvider.init({
        projectId: WC_PROJECT_ID,
        relayUrl: WC_RELAY_URL,
        // TODO: metadata
      });

      // Listen for WalletConnect events
      // 'session_create', 'session_delete', 'session_update', 'connect', 'disconnect'
      provider.on('session_delete', async (session: AnyData) => {
        console.log('Session deleted:', session);
        await disconnectWcSession();
      });

      wcProvider.current = provider;
    }

    // Instantiate a standalone modal using the dapp's WalletConnect projectId.
    if (!wcModal.current) {
      const modal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: WC_PROJECT_ID,
      });

      wcModal.current = modal;
    }

    console.log('> WalletConnect Initialized');
    window.myAPI.relayModeFlag('wc:initialized', true);
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
   * Create or restore a WalletConnect session.
   */
  const createSession = async () => {
    try {
      if (!wcInitializedRef.current) {
        return;
      }

      // If an existing session exists, cache the pairing topic.
      const pairingTopic = wcProvider.current!.session?.pairingTopic;
      wcPairingTopic.current = pairingTopic || null;
      console.log('> Pairing topic:', pairingTopic);

      // If no session exists, create a new one.
      if (!wcProvider.current?.session) {
        console.log('> No existing session found, creating a new one.');

        const { uri, approval } = await wcProvider.current!.client.connect(
          getConnectionParams()
        );

        wcMetaRef.current = { uri, approval };
      } else {
        window.myAPI.relayModeFlag('wc:session:restored', true);
      }
    } catch (error: AnyData) {
      console.error('initWc: An unexpected error occurred:', error);
    }
  };

  /**
   * Restore an existing session. Called when `Connect` UI button clicked.
   * Note: Will prompt wallet to approve addresses.
   */
  const restoreOrConnectSession = async () => {
    /** Create new session if there's no session to restore. */
    if (!wcSessionRestoredRef.current) {
      /** Re-connect to get a new uri and approval function */
      console.log('> Re-create session uri and approval.');
      await createSession();

      /** Open modal. */
      if (wcMetaRef.current?.uri) {
        wcModal.current!.openModal({ uri: wcMetaRef.current.uri });
      }

      return true;
    } else {
      /** NOTE: This branch is currently not run based on the import UI. */
      const expiry = wcProvider.current!.session!.expiry;
      const nowUnix = getUnixTime(new Date());

      /** Existing session not expired. */
      if (nowUnix <= expiry) {
        console.log('> Restored session');

        return false;
      } else {
        console.log('> Session expired. Creating a new one.');

        /** Existing session expired. */
        await disconnectWcSession();

        /** Create a new session. */
        await createSession();

        /** Open modal. */
        if (wcMetaRef.current?.uri) {
          wcModal.current!.openModal({ uri: wcMetaRef.current.uri });
        }

        return true;
      }
    }
  };

  /**
   * Set addresses from existing session. Called with `Fetch` UI button clicked.
   */
  const fetchAddressesFromExistingSession = () => {
    /** Fetch accounts from restored session. */
    const namespaces = wcProvider.current?.session?.namespaces;
    if (!namespaces) {
      // TODO: Send error notification in import window.
      console.log('> Unable to get namespaces of restored session.');
      return;
    }

    /** Set received WalletConnect address state. */
    setFetchedAddresses(namespaces);

    /** Set restored session flag. */
    window.myAPI.relayModeFlag('wc:session:restored', true);
  };

  /**
   * Establish a session or use an existing session to fetch addresses.
   * @todo UI allows calling this function only when creating a new session. Can be simplified.
   */
  const connectWc = async (wcNetworks: WcSelectNetwork[]) => {
    try {
      if (!wcInitializedRef.current) {
        return;
      }

      /** Cache received networks. */
      wcNetworksRef.current = wcNetworks;

      /** Restore existing session or create a new one. */
      window.myAPI.relayModeFlag('wc:connecting', true);
      const modalOpen = await restoreOrConnectSession();
      window.myAPI.relayModeFlag('wc:connecting', false);

      if (!modalOpen) {
        /** Fetch accounts from restored session. */
        fetchAddressesFromExistingSession();
      } else {
        /** Await session approval from the wallet app. */
        const walletConnectSession = await wcMetaRef.current!.approval();

        /** Close modal if we're creating a new session. */
        console.log('> Close modal.');
        if (wcMetaRef.current?.uri) {
          wcModal.current!.closeModal();
        }

        /** Set received WalletConnect address state. */
        setFetchedAddresses(walletConnectSession.namespaces);
        window.myAPI.relayModeFlag('wc:session:restored', true);
      }
    } catch (error: AnyData) {
      console.error('connectWc: An unexpected error occurred:', error);
    }
  };

  /**
   * Disconnect from the current session.
   */
  const disconnectWcSession = async () => {
    if (!wcProvider.current) {
      return;
    }

    window.myAPI.relayModeFlag('wc:disconnecting', true);
    const topic = wcProvider.current.session?.topic;
    if (topic) {
      await wcProvider.current.client.disconnect({
        topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });

      delete wcProvider.current.session;
    }

    wcPairingTopic.current = null;
    wcMetaRef.current = null;

    window.myAPI.relayModeFlag('wc:session:restored', false);
    window.myAPI.relayModeFlag('wc:disconnecting', false);
  };

  /**
   * Initialize the WalletConnect provider on initial render.
   */
  useEffect(() => {
    if (getOnlineMode() && !wcProvider.current) {
      console.log('> Init wallet connect provider (Mount).');
      initProvider();
    }
  }, []);

  useEffect(() => {
    if (getOnlineMode() && !wcProvider.current) {
      console.log('> Init wallet connect provider (Online).');
      initProvider();
    }
  }, [isConnected, isOnlineMode]);

  useEffect(() => {
    wcInitializedRef.current = wcInitialized;

    if (wcInitialized) {
      console.log('> Create session if one does not already exist.');
      createSession();
    }
  }, [wcInitialized]);

  useEffect(() => {
    wcSessionRestoredRef.current = wcSessionRestored;
  }, [wcSessionRestored]);

  return (
    <WalletConnectContext.Provider
      value={{
        connectWc,
        disconnectWcSession,
        fetchAddressesFromExistingSession,
        wcSessionRestored,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};
