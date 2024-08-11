// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useState } from 'react';
import * as defaults from './defaults';
import type { AddressesContextInterface } from './types';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { IpcTask } from '@/types/communication';

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
  /// Addresses state.
  const [ledgerAddresses, setLedgerAddresses] = useState<LedgerLocalAddress[]>(
    []
  );
  const [readOnlyAddresses, setReadOnlyAddresses] = useState<LocalAddress[]>(
    []
  );
  const [vaultAddresses, setVaultAddresses] = useState<LocalAddress[]>([]);

  /// Fetch address data from store when component loads.
  useEffect(() => {
    const fetchAccounts = async () => {
      const sources: AccountSource[] = ['ledger', 'read-only', 'vault'];
      const tasks: IpcTask[] = [];

      for (const source of sources) {
        tasks.push({
          action: 'raw-account:get',
          data: { source },
        });
      }

      const results = await Promise.all([
        window.myAPI.rawAccountTask(tasks[0]),
        window.myAPI.rawAccountTask(tasks[1]),
        window.myAPI.rawAccountTask(tasks[2]),
      ]);

      setLedgerAddresses(JSON.parse(results[0] as string));
      setReadOnlyAddresses(JSON.parse(results[1] as string));
      setVaultAddresses(JSON.parse(results[2] as string));
    };

    fetchAccounts();
  }, []);

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

  return (
    <AddressesContext.Provider
      value={{
        ledgerAddresses,
        readOnlyAddresses,
        vaultAddresses,
        setLedgerAddresses,
        setReadOnlyAddresses,
        setVaultAddresses,
        isAlreadyImported,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
