// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@/config/processes/import';
import { getAddressChainId } from '@/renderer/Utils';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import type { ImportHandlerContextInterface } from './types';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

export const ImportHandlerContext =
  createContext<ImportHandlerContextInterface>(
    defaults.defaultImportHandlerContext
  );

export const useImportHandler = () => useContext(ImportHandlerContext);

export const ImportHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setStatusForAccount } = useAccountStatuses();
  const { setReadOnlyAddresses, setVaultAddresses, setLedgerAddresses } =
    useAddresses();

  /// Exposed function to import an address.
  const handleImportAddress = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    // Set processing flag for account.
    setStatusForAccount(address, source, true);

    // Process account import in main renderer.
    if (source === 'vault') {
      handleVaultImport(address, source, accountName);
    } else if (source === 'ledger') {
      handleLedgerImport(address, source, accountName);
    } else if (source === 'read-only') {
      handleReadOnlyImport(address, source, accountName);
    }
  };

  /// Handle a read-only address import.
  const handleReadOnlyImport = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    setReadOnlyAddresses((prev: LocalAddress[]) => {
      const newAddresses: LocalAddress[] = prev.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: true } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow(address, source, accountName);
  };

  /// Handle a vault address import.
  const handleVaultImport = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    // Update import window's managed address state and local storage.
    setVaultAddresses((prev: LocalAddress[]) => {
      const newAddresses = prev.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: true } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow(address, source, accountName);
  };

  /// Handle a ledger address import.
  const handleLedgerImport = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    // Update import window's managed address state and local storage.
    setLedgerAddresses((prev: LedgerLocalAddress[]) => {
      const newAddresses = prev.map((a: LedgerLocalAddress) =>
        a.address === address ? { ...a, isImported: true } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow(address, source, accountName);
  };

  /// Send address data to main window to process.
  const postAddressToMainWindow = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        chainId: getAddressChainId(address),
        source,
        address,
        name: accountName,
      },
    });
  };

  return (
    <ImportHandlerContext.Provider
      value={{
        handleImportAddress,
      }}
    >
      {children}
    </ImportHandlerContext.Provider>
  );
};
