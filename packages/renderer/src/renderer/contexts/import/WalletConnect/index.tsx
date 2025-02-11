// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useConnections } from '@app/contexts/common/Connections';
import { chainIcon } from '@ren/config/chains';
import { getSdkError } from '@walletconnect/utils';
import { encodeAddress } from '@polkadot/util-crypto';
import { getUnixTime } from 'date-fns';
import { setStateWithRef } from '@w3ux/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  WalletConnectContextInterface,
  WcFetchedAddress,
  WcSelectNetwork,
} from './types';

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
  const { getOnlineMode, isConnected, isOnlineMode } = useConnections();

  /**
   * @todo Make flags relay app flags
   */
  const [wcConnecting, setWcConnecting] = useState(false);
  const [wcDisconnecting, setWcDisconnecting] = useState(false);
  const [wcInitialized, setWcInitialized] = useState(false);

  const [wcSessionRestored, setWcSessionRestored] = useState(false);
  const wcSessionRestoredRef = useRef<boolean>(false);

  /**
   * @todo Move to main renderer
   */
  const wcProvider = useRef<UniversalProvider | null>(null);
  const wcModal = useRef<WalletConnectModal | null>(null);
  const wcPairingTopic = useRef<string | null>(null);

  const wcMetaRef = useRef<{
    uri: string | undefined;
    approval: AnyData;
  } | null>(null);

  /**
   * WalletConnect networks and their selected state.
   *
   * @todo Move to main renderer
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
   *
   * @todo Keep in import renderer
   */
  const [wcFetchedAddresses, setWcFetchedAddresses] = useState<
    WcFetchedAddress[]
  >([]);

  /**
   * Get namespaces of selected networks.
   *
   * @todo Move wcNetworks to main renderer
   * @todo Send selected network ChainIDs to main renderer
   */
  const getNamespaces = () => {
    const selectedNetworks = wcNetworks.filter(({ selected }) => selected);
    if (selectedNetworks.length > 0) {
      return wcNetworks
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
   *
   * @todo Move to main renderer
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
   *
   * @todo Move to main renderer
   * @todo Send fetched addresses to import window via port message
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
  };

  /**
   * Init provider and modal.
   *
   * @todo Move to main renderer
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
    setWcInitialized(true);
  };

  /**
   * Get connection params for WalletConnect session.
   *
   * Requires up to 3 different chain namespaces (polkadot, kusama and westend).
   * The supported methods, chains, and events can all be defined by the dapp
   * team based on the requirements of the dapp.
   *
   * @todo Move to main renderer
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
   *
   * @todo Move to main renderer
   * @todo Send existing session flag to import window to sync UI
   */
  const createSession = async () => {
    try {
      if (!wcInitialized) {
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
        setStateWithRef(true, setWcSessionRestored, wcSessionRestoredRef);
      }
    } catch (error: AnyData) {
      console.error('initWc: An unexpected error occurred:', error);
    }
  };

  /**
   * Restore an existing session. Called when `Connect` UI button clicked.
   * Note: Will prompt wallet to approve addresses.
   *
   * @todo Move to main renderer
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
      /** NOTE: This branch is currently not run based on the UI. */
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
   *
   * @todo Move to main renderer
   */
  const fetchAddressesFromExistingSession = () => {
    /** Fetch accounts from restored session. */
    const namespaces = wcProvider.current?.session?.namespaces;
    if (!namespaces) {
      console.log('> Unable to get namespaces of restored session.');
      return;
    }

    /** Set received WalletConnect address state. */
    setFetchedAddresses(namespaces);
  };

  /**
   * Establish a session or use an existing session to fetch addresses.
   *
   * @todo Move to main renderer
   * @todo Send fetched addresses to import window via port message
   * @todo UI allows calling this function only when creating a new session. Can be simplified
   */
  const connectWc = async () => {
    try {
      if (!wcInitialized) {
        return;
      }

      /** Restore existing session or create a new one. */
      setWcConnecting(true);
      const modalOpen = await restoreOrConnectSession();
      setWcConnecting(false);

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
        setStateWithRef(true, setWcSessionRestored, wcSessionRestoredRef);
      }
    } catch (error: AnyData) {
      console.error('initWc: An unexpected error occurred:', error);
    }
  };

  /**
   * Disconnect from the current session.
   *
   * @todo Move to main renderer
   */
  const disconnectWcSession = async () => {
    if (!wcProvider.current) {
      return;
    }

    setWcDisconnecting(true);
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
    setStateWithRef(false, setWcSessionRestored, wcSessionRestoredRef);
    setWcDisconnecting(false);
  };

  /**
   * Initialize the WalletConnect provider on initial render.
   *
   * @todo Move to main renderer
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
    if (wcInitialized) {
      console.log('> Create session if one does not already exist.');
      createSession();
    }
  }, [wcInitialized]);

  return (
    <WalletConnectContext.Provider
      value={{
        connectWc,
        disconnectWcSession,
        fetchAddressesFromExistingSession,
        setWcFetchedAddresses,
        setWcNetworks,
        wcConnecting,
        wcDisconnecting,
        wcFetchedAddresses,
        wcInitialized,
        wcNetworks,
        wcSessionRestored,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};
