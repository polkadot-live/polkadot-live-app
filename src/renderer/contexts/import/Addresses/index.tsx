// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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

  return (
    <AddressesContext.Provider
      value={{
        ledgerAddresses,
        readOnlyAddresses,
        vaultAddresses,
        setLedgerAddresses,
        setReadOnlyAddresses,
        setVaultAddresses,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
