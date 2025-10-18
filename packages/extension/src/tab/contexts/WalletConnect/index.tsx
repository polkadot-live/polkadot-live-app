// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as wc from '@polkadot-live/consts/walletConnect';
import { ChainList } from '@polkadot-live/consts/chains';
import { WcError } from '@polkadot-live/core';
import { createContext, useEffect, useRef } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { decodeAddress, encodeAddress, u8aToHex } from 'dedot/utils';
import { getSdkError } from '@walletconnect/utils';
import UniversalProvider from '@walletconnect/universal-provider';

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { WalletConnectContextInterface } from '@polkadot-live/contexts/types/main';
import type {
  WalletConnectMeta,
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';
import { useConnections } from '../../../contexts';
import { renderToast } from '@polkadot-live/ui/utils';

export const WalletConnectContext = createContext<
  WalletConnectContextInterface | undefined
>(undefined);

export const useWalletConnect = createSafeContextHook(
  WalletConnectContext,
  'WalletConnectContext'
);

export const WalletConnectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { cacheGet, getOnlineMode } = useConnections();
  const isConnected = cacheGet('mode:connected');
  const onlineMode = cacheGet('mode:online');
  const wcInitialized = cacheGet('wc:initialized');
  const wcSessionRestored = cacheGet('wc:session:restored');

  const wcProvider = useRef<UniversalProvider | null>(null);
  const wcSession = useRef<AnyData | null>(null);
  const wcPairingTopic = useRef<string | null>(null);
  const wcSessionRestoredRef = useRef<boolean>(false);
  const wcSigningChain = useRef<ChainID | null>(null);

  const wcMetaRef = useRef<{
    uri: string | undefined;
    approval: AnyData;
  } | null>(null);

  const wcInitializedRef = useRef(false);
  const wcNetworksRef = useRef<WcSelectNetwork[]>([]);

  /**
   * Utility to relay a connection flag.
   */
  const relayFlag = async (key: string, value: boolean) =>
    await chrome.runtime.sendMessage({
      type: 'sharedState',
      task: 'relay',
      payload: { key, value },
    });

  /**
   * Utility to set signing chain reference.
   */
  const setSigningChain = (signingChain: ChainID | null) => {
    wcSigningChain.current = signingChain;
  };

  /**
   * Map to track a transaction's canceled signing status.
   *
   * If the overlay `Cancel` button is clicked whilst waiting for a WalletConnect
   * signature, the transaction's flag is set to `false`. This will prevent the
   * extrinsic from being submitted if the user decides to approve the signature.
   *
   * If the user cancels the signature approval within the wallet, the transaction
   * entry is deleted, and the user will be able to attempt another signature.
   */
  const wcTxSignMap = useRef<Map<string, boolean>>(new Map());

  const updateWcTxSignMap = (txId: string, flag: boolean) => {
    if (wcTxSignMap.current.has(txId)) {
      wcTxSignMap.current.set(txId, flag);
    }
  };

  /**
   * Get namespaces of selected networks.
   */
  const getNamespaces = () => {
    const selectedNetworks = wcNetworksRef.current.filter(
      ({ selected }) => selected
    );

    // Select signing network if it's not already.
    if (wcSigningChain.current) {
      const cid = wcSigningChain.current;
      const included = selectedNetworks.find(({ chainId }) => chainId === cid);

      if (!included) {
        selectedNetworks.push({
          caipId: wc.getWalletConnectChainId(cid)!,
          chainId: cid,
          selected: true,
        });
      }
    }

    if (selectedNetworks.length > 0) {
      return selectedNetworks.map(({ caipId }) => `polkadot:${caipId}`);
    } else {
      return [
        `polkadot:${wc.WC_POLKADOT_CAIP_ID}`,
        `polkadot:${wc.WC_KUSAMA_CAIP_ID}`,
        `polkadot:${wc.WC_PASEO_ASSET_HUB_CAIP_ID}`,
        `polkadot:${wc.WC_WESTMINT_CAIP_ID}`,
      ];
    }
  };

  /**
   * Util for setting fetched addresses state.
   */
  const setFetchedAddresses = (namespaces: AnyData) => {
    // Get the accounts from the session.
    const wcAccounts = Object.values(namespaces)
      .map((namespace: AnyData) => namespace.accounts)
      .flat();

    // Grab account addresses and their CAIP ID.
    const accounts: { address: string; caipId: string }[] = wcAccounts.map(
      (wcAccount) => ({
        address: wcAccount.split(':')[2],
        caipId: wcAccount.split(':')[1],
      })
    );

    // Send fetched accounts to import window.
    const fetchedAddresses: WcFetchedAddress[] = accounts.map(
      ({ address, caipId }) => {
        const chainId = wc.WcCaipToChainID[caipId];
        const prefix = ChainList.get(chainId)!.prefix;

        return {
          chainId,
          encoded: encodeAddress(address, prefix),
          publicKeyHex: u8aToHex(decodeAddress(address)),
          substrate: address,
          selected: false,
        };
      }
    );

    // Set fetched addresses state in other context.
    chrome.runtime.sendMessage({
      type: 'walletConnect:relay',
      task: 'setAddresses',
      payload: { fetchedAddresses },
    });
  };

  /**
   * Init provider and modal.
   */
  const initProvider = async () => {
    if (!wcProvider.current) {
      // Instantiate provider.
      const provider = await UniversalProvider.init({
        projectId: wc.WC_PROJECT_IDS['browser'],
        relayUrl: wc.WC_RELAY_URL,
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
    relayFlag('wc:initialized', true);
  };

  /**
   * Get connection params for WalletConnect session.
   *
   * Requires multiple chain namespaces (polkadot, kusama, westend, etc.)
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
   * Utility to cache `uri` and `approval`.
   */
  const cacheWcMeta = async () => {
    const { uri, approval } = await wcProvider.current!.client.connect(
      getConnectionParams()
    );
    wcMetaRef.current = { uri, approval };
  };

  /**
   * Disconnects from an existing session and starts a new one (opens modal).
   */
  const startNewSession = async () => {
    await Promise.all([
      relayFlag('extrinsic:building', true),
      relayFlag('wc:connecting', true),
    ]);

    await disconnectWcSession();
    await cacheWcMeta();

    await Promise.all([
      relayFlag('wc:connecting', false),
      relayFlag('extrinsic:building', false),
    ]);

    // Open modal.
    await chrome.runtime.sendMessage({
      type: 'walletConnect:relay',
      task: 'openModal',
      payload: { uri: wcMetaRef.current!.uri },
    });

    const session = await wcMetaRef.current!.approval();
    wcSession.current = session;
    wcPairingTopic.current = session.pairingTopic;
    await relayFlag('wc:session:restored', true);

    // Close modal.
    await chrome.runtime.sendMessage({
      type: 'walletConnect:relay',
      task: 'closeModal',
    });
  };

  /**
   * Try to cache a WalletConnect session or prepare a new one.
   */
  const tryCacheSession = async (
    origin: 'extrinsics' | 'import' | null = null
  ) => {
    try {
      if (!wcInitializedRef.current) {
        throw new WcError('WcNotInitialized');
      }

      // Cache an existing session and pairing topic.
      if (wcProvider.current?.session) {
        wcPairingTopic.current = wcProvider.current.session.pairingTopic;
        wcSession.current = wcProvider.current.session;
        relayFlag('wc:session:restored', true);
      } else {
        await cacheWcMeta();
      }
    } catch (error: AnyData) {
      handleWcError(error, origin);
    }
  };

  /**
   * Set addresses from existing session. Called with `Fetch` UI button clicked.
   */
  const fetchAddressesFromExistingSession = () => {
    const namespaces = wcSession.current ? wcSession.current.namespaces : null;
    if (!namespaces) {
      throw new WcError('WcSessionError');
    }

    setFetchedAddresses(namespaces);
    relayFlag('wc:session:restored', true);
  };

  /**
   * Establish a session or use an existing session to fetch addresses.
   * Initiated from the `import` view.
   */
  const connectWc = async (wcNetworks: WcSelectNetwork[]) => {
    try {
      // Cache received networks.
      wcNetworksRef.current = wcNetworks;

      // Restore existing session or create a new one.
      if (wcProvider.current?.session) {
        wcPairingTopic.current = wcProvider.current.session.pairingTopic;
        wcSession.current = wcProvider.current.session;
        fetchAddressesFromExistingSession();
        relayFlag('wc:session:restored', true);
      } else {
        await startNewSession();
        setFetchedAddresses(wcSession.current.namespaces);
        relayFlag('wc:session:restored', true);
      }
    } catch (error: AnyData) {
      handleWcError(error, 'import');
    }
  };

  /**
   * Verify a signing account is approved in the WalletConnect session.
   * Initiated from the `extrinsics` view.
   * @todo
   */
  const verifySigningAccount = async (
    target: string,
    chainId: ChainID
  ): Promise<{ approved: boolean; errorThrown: boolean }> => ({
    approved: false,
    errorThrown: false,
  });

  /**
   * Post verification status to extrinsics window.
   * Initiated from the `extrinsics` view.
   * @todo
   */
  const postApprovedResult = (verifyResult: {
    approved: boolean;
    errorThrown: boolean;
  }) => {
    /* empty */
  };

  /**
   * Ensure a session exists with the signing account approved before signing an extrinsic.
   * Initiated from the `extrinsics` view.
   * @todo
   */
  const wcEstablishSessionForExtrinsic = async (
    signingAddress: string,
    chainId: ChainID
  ) => {
    /* empty */
  };

  /**
   * Sign an extrinsic via WalletConnect.
   * Initiated from the `extrinsics` view.
   * @todo
   */
  const wcSignExtrinsic = async (info: ExtrinsicInfo) => {
    /* empty */
  };

  /**
   * Disconnect from the current session.
   */
  const disconnectWcSession = async () => {
    if (!wcProvider.current) {
      return;
    }

    await relayFlag('wc:disconnecting', true);
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
    wcSession.current = null;

    await Promise.all([
      relayFlag('wc:session:restored', false),
      relayFlag('wc:disconnecting', false),
    ]);
  };

  /**
   * Handle a WalletConnect error.
   */
  const handleWcError = (
    error: AnyData,
    origin: 'import' | 'extrinsics' | null = null
  ) => {
    console.error(error);
    if (!origin) {
      return;
    }

    if (error instanceof WcError) {
      const feedback = wc.wcErrorFeedback[error.statusCode];
      origin === 'extrinsics'
        ? sendWcError(feedback)
        : sendToastError(feedback.body.msg);
    } else if (error.code === -32000) {
      sendWcError(wc.wcErrorFeedback['WcCanceledTx']);
    } else {
      sendWcError(wc.wcErrorFeedback['WcCatchAll']);
    }
  };

  /**
   * Util to render a toast error in the target window.
   */
  const sendToastError = (message: string) => {
    renderToast(message, `wc-error-${String(Date.now())}`, 'error');
  };

  /**
   * Util to send WalletConnect error data to extrinsics window.
   * @todo
   */
  const sendWcError = (message: WalletConnectMeta) => {
    /* empty */
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
  }, [isConnected, onlineMode]);

  useEffect(() => {
    wcInitializedRef.current = wcInitialized;

    if (wcInitialized) {
      console.log('> Create session if one does not already exist.');
      tryCacheSession();
    }
  }, [wcInitialized]);

  useEffect(() => {
    wcSessionRestoredRef.current = wcSessionRestored;
  }, [wcSessionRestored]);

  return (
    <WalletConnectContext
      value={{
        wcSessionRestored,
        connectWc,
        disconnectWcSession,
        fetchAddressesFromExistingSession,
        postApprovedResult,
        setSigningChain,
        tryCacheSession,
        wcEstablishSessionForExtrinsic,
        wcSignExtrinsic,
        updateWcTxSignMap,
        verifySigningAccount,
      }}
    >
      {children}
    </WalletConnectContext>
  );
};
