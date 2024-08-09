// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';
import { createContext, useContext, useState } from 'react';
import * as defaults from './defaults';
import type { AddressesContextInterface } from './types';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export const AddressesContext = createContext<AddressesContextInterface>(
  defaults.defaultAddressesContext
);

/**
 * @name useAddresses
 * @summary Manages state of addresses for the `import` child window.
 */
export const useAddresses = () => useContext(AddressesContext);

export const AddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Ledger addresses state.
  const [ledgerAddresses, setLedgerAddresses] = useState<LedgerLocalAddress[]>(
    () => {
      const key = ConfigImport.getStorageKey('ledger');
      const fetched: string | null = localStorage.getItem(key);
      const parsed: LedgerLocalAddress[] =
        fetched !== null ? JSON.parse(fetched) : [];
      return parsed;
    }
  );

  /// Read-only addresses state.
  const [readOnlyAddresses, setReadOnlyAddresses] = useState<LocalAddress[]>(
    () => {
      const key = ConfigImport.getStorageKey('read-only');
      const fetched: string | null = localStorage.getItem(key);
      const parsed: LocalAddress[] =
        fetched !== null ? JSON.parse(fetched) : [];
      return parsed;
    }
  );

  /// Vault addresses state.
  const [vaultAddresses, setVaultAddresses] = useState<LocalAddress[]>(() => {
    const key = ConfigImport.getStorageKey('vault');
    const fetched: string | null = localStorage.getItem(key);
    const parsed: LocalAddress[] = fetched !== null ? JSON.parse(fetched) : [];
    return parsed;
  });

  /// Check if an address has already been imported.
  const isAlreadyImported = (address: string): boolean => {
    const checkAll = <T extends { address: string }>(
      items: T[],
      target: string
    ): boolean =>
      items.reduce(
        (acc, cur) => (acc ? acc : cur.address === target ? true : false),
        false
      );

    return (
      checkAll(ledgerAddresses, address) ||
      checkAll(vaultAddresses, address) ||
      checkAll(readOnlyAddresses, address)
    );
  };

  /// Add account from received AccountJson data.
  const importAccountJson = (json: LocalAddress) => {
    const { address, source } = json;
    const key = ConfigImport.getStorageKey(source);
    const fetched: string | null = localStorage.getItem(key);
    const parsed: LocalAddress[] = fetched ? JSON.parse(fetched) : [];

    // Don't import address if it already exists.
    const isNewAddress = parsed.every((a) => a.address !== address);
    if (!isNewAddress) {
      return;
    }

    // Calculate new address state.
    const newAddresses = [...parsed, json];

    // Update local storage.
    localStorage.setItem(key, JSON.stringify(newAddresses));

    // Update context state.
    switch (source) {
      case 'read-only': {
        setReadOnlyAddresses(newAddresses);
        break;
      }
      case 'vault': {
        setVaultAddresses(newAddresses);
        break;
      }
      default: {
        throw new Error(
          `Importing account via JSON with source ${source} not supported.`
        );
      }
    }
  };

  return (
    <AddressesContext.Provider
      value={{
        ledgerAddresses,
        readOnlyAddresses,
        vaultAddresses,
        setLedgerAddresses,
        setReadOnlyAddresses,
        setVaultAddresses,
        importAccountJson,
        isAlreadyImported,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
