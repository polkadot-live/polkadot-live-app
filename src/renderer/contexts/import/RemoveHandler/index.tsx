// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@/config/processes/import';
import { getAddressChainId } from '@/renderer/Utils';
import { createContext, useContext } from 'react';
import { useAddresses } from '@app/contexts/import/Addresses';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { RemoveHandlerContextInterface } from './types';

export const RemoveHandlerContext =
  createContext<RemoveHandlerContextInterface>(
    defaults.defaultRemoveHandlerContext
  );

export const useRemoveHandler = () => useContext(RemoveHandlerContext);

export const RemoveHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setReadOnlyAddresses, setVaultAddresses, setLedgerAddresses } =
    useAddresses();

  /// Exposed function to remove an address.
  const handleRemoveAddress = (address: string, source: AccountSource) => {
    if (source === 'vault') {
      handleRemoveVaultAddress(address, source);
    } else if (source === 'ledger') {
      handleRemoveLedgerAddress(address, source);
    } else if (source === 'read-only') {
      handleRemoveReadOnlyAddress(address, source);
    }
  };

  // Handle removal of a read-only address.
  const handleRemoveReadOnlyAddress = (
    address: string,
    source: AccountSource
  ) => {
    // Update import window's managed address state and local storage.
    setReadOnlyAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: false } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow(address);
  };

  /// Handle removal of a vault address.
  const handleRemoveVaultAddress = (address: string, source: AccountSource) => {
    // Update import window's managed address state and local storage.
    setVaultAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: false } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow(address);
  };

  /// Handle removal of a ledger address.
  const handleRemoveLedgerAddress = (
    address: string,
    source: AccountSource
  ) => {
    // Update import window's managed address state and local storage.
    setLedgerAddresses((prevState: LedgerLocalAddress[]) => {
      const newAddresses = prevState.map((a: LedgerLocalAddress) =>
        a.address === address ? { ...a, isImported: false } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow(address);
  };

  /// Send address data to main window to process removal.
  const postAddressToMainWindow = (address: string) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:remove',
      data: {
        address,
        chainId: getAddressChainId(address),
      },
    });
  };

  return (
    <RemoveHandlerContext.Provider
      value={{
        handleRemoveAddress,
      }}
    >
      {children}
    </RemoveHandlerContext.Provider>
  );
};
