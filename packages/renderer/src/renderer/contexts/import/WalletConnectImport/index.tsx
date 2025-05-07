// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import * as wc from '@polkadot-live/consts/walletConnect';

import { Config as ConfigImport } from '@polkadot-live/core/config/import';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import type { WalletConnectImportContextInterface } from './types';
import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useImportHandler } from '@app/contexts/import/ImportHandler';
import { WalletConnectModal } from '@walletconnect/modal';

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
        handleOpenCloseWcModal,
        setWcNetworks,
        setWcFetchedAddresses,
      }}
    >
      {children}
    </WalletConnectImportContext.Provider>
  );
};
