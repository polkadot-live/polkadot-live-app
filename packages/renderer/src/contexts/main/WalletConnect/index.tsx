// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import * as wc from '@polkadot-live/consts/walletConnect';

import { ChainList } from '@polkadot-live/consts/chains';
import { ConfigRenderer, ExtrinsicsController } from '@polkadot-live/core';
import UniversalProvider from '@walletconnect/universal-provider';
import { createContext, useContext, useEffect, useRef } from 'react';
import { decodeAddress, encodeAddress, u8aToHex } from 'dedot/utils';
import { useConnections } from '@ren/contexts/common';
import { getSdkError } from '@walletconnect/utils';

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { WalletConnectContextInterface } from './types';
import type {
  WcErrorStatusCode,
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

class WcError extends Error {
  statusCode: WcErrorStatusCode;

  constructor(statusCode: WcErrorStatusCode, message = 'WcError') {
    super(message);
    this.name = 'WcError';
    this.statusCode = statusCode;
  }
}

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
        `polkadot:${wc.WC_PASEO_CAIP_ID}`,
        `polkadot:${wc.WC_WESTMINT_CAIP_ID}`,
      ];
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
        projectId: wc.WC_PROJECT_ID,
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
    window.myAPI.relaySharedState('wc:initialized', true);
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
   * Try to cache a WalletConnect session or prepare a new one.
   */
  const tryCacheSession = async () => {
    try {
      if (!wcInitializedRef.current) {
        throw new WcError('WcNotInitialized');
      }

      // Cache an existing session and pairing topic.
      if (wcProvider.current?.session) {
        wcPairingTopic.current = wcProvider.current.session.pairingTopic;
        wcSession.current = wcProvider.current.session;

        // Cache meta if it's currently undefined.
        if (!wcMetaRef.current) {
          await cacheWcMeta();
        }

        window.myAPI.relaySharedState('wc:session:restored', true);
      } else {
        console.log('> Re-create session uri and approval.');
        await cacheWcMeta();
      }
    } catch (error: AnyData) {
      handleWcError(error);
    }
  };

  /**
   * Restore an existing session. Called when `Connect` UI button clicked.
   * Note: Will prompt wallet to approve addresses.
   */
  const cacheOrPrepareSession = async (
    modalWindow: 'import' | 'extrinsics'
  ) => {
    if (!wcInitializedRef.current) {
      throw new WcError('WcNotInitialized');
    }

    // Get existing session or generate a new uri and approval.
    await tryCacheSession();

    // If no existing session, open the modal in target window.
    if (wcMetaRef.current?.uri) {
      switch (modalWindow) {
        case 'import': {
          ConfigRenderer.portToImport?.postMessage({
            task: 'import:wc:modal:open',
            data: { uri: wcMetaRef.current.uri },
          });
          break;
        }
        case 'extrinsics': {
          ConfigRenderer.portToAction?.postMessage({
            task: 'action:wc:modal:open',
            data: { uri: wcMetaRef.current.uri },
          });
          break;
        }
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
      throw new WcError('WcSessionError');
    }

    // Set received WalletConnect address state.
    setFetchedAddresses(namespaces);

    // Set restored session flag.
    window.myAPI.relaySharedState('wc:session:restored', true);
  };

  /**
   * Establish a session or use an existing session to fetch addresses.
   * @todo UI allows calling this function only when creating a new session. Can be simplified.
   */
  const connectWc = async (wcNetworks: WcSelectNetwork[]) => {
    try {
      // Cache received networks.
      wcNetworksRef.current = wcNetworks;

      // Restore existing session or create a new one.
      window.myAPI.relaySharedState('wc:connecting', true);
      await cacheOrPrepareSession('import');
      window.myAPI.relaySharedState('wc:connecting', false);

      if (!wcMetaRef.current?.uri) {
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
        window.myAPI.relaySharedState('wc:session:restored', true);
      }
    } catch (error: AnyData) {
      console.error(error);
    }
  };

  /**
   * Verify a signing account is approved in the WalletConnect session.
   */
  const verifySigningAccount = async (target: string, chainId: ChainID) => {
    try {
      window.myAPI.relaySharedState('wc:account:verifying', true);

      if (!wcSession.current) {
        throw new WcError('WcSessionNotFound');
      }

      // Get the accounts from the session.
      const caip = wc.getWalletConnectChainId(chainId)!;
      const accounts: { address: string; caipId: string }[] = Object.values(
        wcSession.current.namespaces
      )
        .map((namespace: AnyData) => namespace.accounts)
        .flat()
        .map((wcAccount) => ({
          address: wcAccount.split(':')[2],
          caipId: wcAccount.split(':')[1],
        }))
        .filter(({ caipId }) => caipId === caip);

      // Verify signing account exists in the session.
      const prefix = ChainList.get(chainId)!.prefix;
      const found = accounts.find(
        ({ address }) => encodeAddress(address, prefix) === target
      );

      // Update relay flags.
      setTimeout(() => {
        const approved = found ? true : false;
        window.myAPI.relaySharedState('wc:account:verifying', false);
        window.myAPI.relaySharedState('wc:account:approved', approved);

        if (!approved) {
          // Toast error notification in extrinsics window.
          ConfigRenderer.portToAction?.postMessage({
            task: 'action:toast:show',
            data: {
              message: 'WalletConnect Error - Approve the signing account',
              toastId: `wc-error-${String(Date.now())}`,
              toastType: 'error',
            },
          });
        }
      }, 2_500);
    } catch (error) {
      handleWcError(error);
    }
  };

  /**
   * Ensure a session exists with the signing account approved before signing an extrinsic.
   */
  const wcEstablishSessionForExtrinsic = async (
    signingAddress: string,
    chainId: ChainID
  ) => {
    try {
      window.myAPI.relaySharedState('wc:connecting', true);
      await cacheOrPrepareSession('extrinsics');

      window.myAPI.relaySharedState('wc:connecting', false);
      window.myAPI.relaySharedState('extrinsic:building', false);

      // Await approval and cache session and pairing topic.
      const session = await wcMetaRef.current!.approval();
      wcSession.current = session;
      wcPairingTopic.current = session.pairingTopic;
      window.myAPI.relaySharedState('wc:session:restored', true);

      // Close modal in extrinsics window.
      if (wcMetaRef.current?.uri) {
        ConfigRenderer.portToAction?.postMessage({
          task: 'action:wc:modal:close',
          data: null,
        });
      }

      // Re-verify the session.
      await verifySigningAccount(signingAddress, chainId);
    } catch (error: AnyData) {
      console.log(error);
    }
  };

  /**
   * Sign an extrinsic via WalletConnect.
   */
  const wcSignExtrinsic = async (info: ExtrinsicInfo) => {
    try {
      const { txId } = info;
      const txData = ExtrinsicsController.getTransactionPayload(txId);

      // Send error if data is insufficient.
      if (
        !(
          wcSession.current &&
          wcProvider.current &&
          txData?.payload &&
          info.dynamicInfo
        )
      ) {
        throw new WcError('WcInsufficientTxData');
      }

      // Send error if this transaction is waiting to be canceled in wallet.
      if (wcTxSignMap.current.has(txId)) {
        if (!wcTxSignMap.current.get(txId)!) {
          throw new WcError('WcCancelPending');
        }
      }

      // Add an entry into the sign map.
      wcTxSignMap.current.set(txId, true);

      const { from, chainId } = info.actionMeta;
      const topic = wcSession.current.topic;
      const caip = wc.getWalletConnectChainId(chainId);

      const result: AnyData = await wcProvider.current.client.request({
        chainId: `polkadot:${caip}`,
        topic,
        request: {
          method: 'polkadot_signTransaction',
          params: {
            address: from,
            transactionPayload: txData.payload,
          },
        },
      });

      // Retrieve sign flag to determine if tx has been canceled.
      const proceed = wcTxSignMap.current.has(txId)
        ? wcTxSignMap.current.get(txId)!
        : false;

      // Handle a canceled transaction.
      if (!proceed) {
        throw new WcError('WcCanceledTx');
      }

      // Attach signature to info and submit transaction.
      wcTxSignMap.current.delete(txId);
      info.dynamicInfo.txSignature = result.signature;
      ExtrinsicsController.submit(info);

      // Close overlay in extrinsics window.
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:overlay:close',
        data: null,
      });
    } catch (error: AnyData) {
      window.myAPI.relaySharedState('extrinsic:building', false);
      wcTxSignMap.current.delete(info.txId);
      handleWcError(error);
    }
  };

  /**
   * Disconnect from the current session.
   */
  const disconnectWcSession = async () => {
    if (!wcProvider.current) {
      return;
    }

    window.myAPI.relaySharedState('wc:disconnecting', true);
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

    window.myAPI.relaySharedState('wc:session:restored', false);
    window.myAPI.relaySharedState('wc:disconnecting', false);
  };

  /**
   * Handle a WalletConnect error.
   */
  const handleWcError = (error: AnyData) => {
    console.log(error);

    if (error instanceof WcError) {
      switch (error.statusCode) {
        case 'WcSessionError': {
          sendToastError('import', 'Session Error - Establish a new session');
          break;
        }
        case 'WcSessionNotFound': {
          window.myAPI.relaySharedState('wc:account:verifying', false);
          sendToastError(
            'extrinsics',
            'WalletConnect Error - Session not found'
          );
          break;
        }
        case 'WcInsufficientTxData': {
          const message = 'WalletConnect Error - Insufficient data';
          sendToastError('extrinsics', message);
          break;
        }
        case 'WcCancelPending': {
          const message = 'Error - Cancel pending signature before re-signing';
          sendToastError('extrinsics', message);
          break;
        }
      }
      return;
    }

    error.code === -32000
      ? sendToastError('extrinsics', 'WalletConnect - Signature canceled')
      : sendToastError('extrinsics', 'WalletConnect Error');
  };

  /**
   * Util to render a toast error in the target window.
   */
  const sendToastError = (target: 'import' | 'extrinsics', message: string) => {
    const port =
      target === 'import'
        ? ConfigRenderer.portToImport
        : ConfigRenderer.portToAction;

    port?.postMessage({
      task: 'action:toast:show',
      data: {
        message,
        toastId: `wc-error-${String(Date.now())}`,
        toastType: 'error',
      },
    });
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
    <WalletConnectContext.Provider
      value={{
        wcSessionRestored,
        connectWc,
        disconnectWcSession,
        fetchAddressesFromExistingSession,
        setSigningChain,
        tryCacheSession,
        wcEstablishSessionForExtrinsic,
        wcSignExtrinsic,
        updateWcTxSignMap,
        verifySigningAccount,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};
