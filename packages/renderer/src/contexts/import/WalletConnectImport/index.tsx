// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as wc from '@polkadot-live/consts/walletConnect';
import { ConfigImport } from '@polkadot-live/core';
import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { useAddresses, useImportHandler } from '@ren/contexts/import';
import { WalletConnectModal } from '@walletconnect/modal';
import type { WalletConnectImportContextInterface } from './types';
import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

export const WalletConnectImportContext = createContext<
  WalletConnectImportContextInterface | undefined
>(undefined);

export const useWalletConnectImport = createSafeContextHook(
  WalletConnectImportContext,
  'WalletConnectImportContext'
);

export const WalletConnectImportProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAlreadyImported, getNextNames } = useAddresses();
  const { handleImportAddress } = useImportHandler();
  const [isImporting, setIsImporting] = useState(false);

  /**
   * WalletConnect modal.
   */
  const wcModal = useRef<WalletConnectModal | null>(null);

  /**
   * WalletConnect networks and their selected state.
   */
  const [wcNetworks, setWcNetworks] = useState<WcSelectNetwork[]>(
    wc.WcNetworks
  );

  /**
   * Instantiate modal when component mounts.
   */
  useEffect(() => {
    if (!wcModal.current) {
      const modal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: wc.WC_PROJECT_ID,
      });

      wcModal.current = modal;
    }
  }, []);

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
   * Handle opening and closing WalletConnect modal.
   */
  const handleOpenCloseWcModal = async (open: boolean, uri?: string) => {
    if (open && uri && wcModal.current) {
      await wcModal.current.openModal({ uri });
    }
    if (!open && wcModal.current) {
      wcModal.current.closeModal();
    }
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
    const accountNames = getNextNames(selectedAddresses.length);

    let i = 0;
    for (const selected of selectedAddresses) {
      const { encoded, publicKeyHex } = selected;

      if (isAlreadyImported(publicKeyHex)) {
        continue;
      }

      const accountName = accountNames[i];
      const toast = accountNames.length === 1;
      const s = 'wallet-connect';
      const d = undefined;
      await handleImportAddress(encoded, s, accountName, d, toast);
      i += 1;
    }

    setIsImporting(false);
    setShowImportUi(false);

    // Clear selected WalletAccount addresses.
    setWcFetchedAddresses((prev) =>
      prev.map((item) => ({ ...item, selected: false }))
    );
  };

  return (
    <WalletConnectImportContext
      value={{
        isImporting,
        wcFetchedAddresses,
        wcNetworks,
        getSelectedAddresses,
        handleConnect,
        handleDisconnect,
        handleFetch,
        handleImportProcess,
        handleOpenCloseWcModal,
        setWcNetworks,
        setWcFetchedAddresses,
      }}
    >
      {children}
    </WalletConnectImportContext>
  );
};
