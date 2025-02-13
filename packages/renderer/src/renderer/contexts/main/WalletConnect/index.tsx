// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import * as wcConfig from '@ren/config/walletConnect';

import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import UniversalProvider from '@walletconnect/universal-provider';
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

const mapCaipChainId = new Map<string, ChainID>([
  [wcConfig.WC_POLKADOT_CAIP_ID, 'Polkadot'],
  [wcConfig.WC_KUSAMA_CAIP_ID, 'Kusama'],
  [wcConfig.WC_WESTEND_CAIP_ID, 'Westend'],
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

  const wcProvider = useRef<UniversalProvider | null>(null);
  const wcSession = useRef<AnyData | null>(null);
  const wcPairingTopic = useRef<string | null>(null);
  const wcSessionRestoredRef = useRef<boolean>(false);

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
        `polkadot:${wcConfig.WC_POLKADOT_CAIP_ID}`,
        `polkadot:${wcConfig.WC_KUSAMA_CAIP_ID}`,
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
        projectId: wcConfig.WC_PROJECT_ID,
        relayUrl: wcConfig.WC_RELAY_URL,
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

      // Cache an existing session and pairing topic.
      if (wcProvider.current?.session) {
        wcPairingTopic.current = wcProvider.current.session.pairingTopic;
        wcSession.current = wcProvider.current.session;
      }

      // If no session exists, get a new approval function.
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
    // Create new session if there's no session to restore.
    if (!wcSessionRestoredRef.current) {
      // Re-connect to get a new uri and approval function
      console.log('> Re-create session uri and approval.');
      await createSession();

      // Send message to import window to open the modal.
      if (wcMetaRef.current?.uri) {
        ConfigRenderer.portToImport?.postMessage({
          task: 'import:wc:modal:open',
          data: { uri: wcMetaRef.current.uri },
        });
      }

      return true;
    } else {
      // NOTE: This branch is currently not run based on the import UI.
      const expiry = wcProvider.current!.session!.expiry;
      const nowUnix = getUnixTime(new Date());

      // Existing session not expired.
      if (nowUnix <= expiry) {
        console.log('> Restored session');

        return false;
      } else {
        console.log('> Session expired. Creating a new one.');

        // Existing session expired.
        await disconnectWcSession();

        // Create a new session.
        await createSession();

        // Open modal.
        if (wcMetaRef.current?.uri) {
          // Send message to import window to open the modal.
          ConfigRenderer.portToImport?.postMessage({
            task: 'import:wc:modal:open',
            data: { uri: wcMetaRef.current.uri },
          });
        }

        return true;
      }
    }
  };

  /**
   * Set addresses from existing session. Called with `Fetch` UI button clicked.
   */
  const fetchAddressesFromExistingSession = () => {
    // Fetch accounts from the cached session.
    const namespaces = wcSession.current ? wcSession.current.namespaces : null;

    if (!namespaces) {
      // Render toast error notification in import window.
      ConfigRenderer.portToImport?.postMessage({
        task: 'import:toast:show',
        data: {
          message: 'Session Error - Establish a new session',
          toastId: `wc-error-${String(Date.now())}`,
          toastType: 'error',
        },
      });

      return;
    }

    // Set received WalletConnect address state.
    setFetchedAddresses(namespaces);

    // Set restored session flag.
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

      // Cache received networks.
      wcNetworksRef.current = wcNetworks;

      // Restore existing session or create a new one.
      window.myAPI.relayModeFlag('wc:connecting', true);
      const modalOpen = await restoreOrConnectSession();
      window.myAPI.relayModeFlag('wc:connecting', false);

      if (!modalOpen) {
        fetchAddressesFromExistingSession();
      } else {
        // Await approval and cache session and pairing topic.
        const session = await wcMetaRef.current!.approval();
        wcSession.current = session;
        wcPairingTopic.current = session.pairingTopic;

        // Close modal in import window if we're creating a new session.
        if (wcMetaRef.current?.uri) {
          ConfigRenderer.portToImport?.postMessage({
            task: 'import:wc:modal:close',
            data: null,
          });
        }

        // Set received WalletConnect address state.
        setFetchedAddresses(session.namespaces);
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
