// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as defaults from './defaults';
import { setStateWithRef } from '@w3ux/utils';
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
  type LLA = LedgerLocalAddress;
  type LA = LocalAddress;

  /// Addresses state.
  const [ledgerAddresses, setLedgerAddresses] = useState<LLA[]>([]);
  const [readOnlyAddresses, setReadOnlyAddresses] = useState<LA[]>([]);
  const [vaultAddresses, setVaultAddresses] = useState<LA[]>([]);

  /// References to addresses state.
  const ledgerAddressesRef = useRef<LLA[]>([]);
  const readOnlyAddressesRef = useRef<LA[]>([]);
  const vaultAddressesRef = useRef<LA[]>([]);

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

      setStateWithRef(
        JSON.parse(results[0] as string),
        setLedgerAddresses,
        ledgerAddressesRef
      );

      setStateWithRef(
        JSON.parse(results[1] as string),
        setReadOnlyAddresses,
        readOnlyAddressesRef
      );

      setStateWithRef(
        JSON.parse(results[2] as string),
        setVaultAddresses,
        vaultAddressesRef
      );
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
      checkAll(ledgerAddressesRef.current, address) ||
      checkAll(vaultAddressesRef.current, address) ||
      checkAll(readOnlyAddressesRef.current, address)
    );
  };

  /// Get addresses from appropriate reference.
  const getAddressesOfSource = (
    source: AccountSource
  ): LedgerLocalAddress[] | LocalAddress[] => {
    switch (source) {
      case 'ledger': {
        return ledgerAddressesRef.current;
      }
      case 'read-only': {
        return readOnlyAddressesRef.current;
      }
      case 'vault': {
        return vaultAddressesRef.current;
      }
      default: {
        return [] as LocalAddress[];
      }
    }
  };

  /// Update import window read-only addresses state and reference upon address import.
  const handleAddressImport = (
    source: AccountSource,
    local: LocalAddress | LedgerLocalAddress
  ) => {
    switch (source) {
      case 'ledger': {
        setLedgerAddresses((prev: LedgerLocalAddress[]) => {
          const updated = prev
            .filter((a) => a.address !== local.address)
            .concat([{ ...(local as LedgerLocalAddress) }]);
          ledgerAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: LocalAddress[]) => {
          const updated = prev
            .filter((a) => a.address !== local.address)
            .concat([{ ...(local as LocalAddress) }]);
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'vault': {
        setVaultAddresses((prev: LocalAddress[]) => {
          const updated = prev
            .filter((a) => a.address !== local.address)
            .concat([{ ...(local as LocalAddress) }]);
          vaultAddressesRef.current = updated;
          return updated;
        });

        break;
      }
    }
  };

  /// Update import window read-only addresses state and reference upon address deletion.
  const handleAddressDelete = (
    source: AccountSource,
    address: string
  ): boolean => {
    switch (source) {
      case 'ledger': {
        setLedgerAddresses((prev: LedgerLocalAddress[]) => {
          const updated = prev.filter((a) => a.address !== address);
          ledgerAddressesRef.current = updated;
          return updated;
        });

        return true;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: LocalAddress[]) => {
          const updated = prev.filter((a) => a.address !== address);
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        return false;
      }
      case 'vault': {
        let goBack = false;
        setVaultAddresses((prev: LocalAddress[]) => {
          const updated = prev.filter((a) => a.address !== address);
          vaultAddressesRef.current = updated;
          updated.length === 0 && (goBack = true);
          return updated;
        });

        return goBack;
      }
      default: {
        return false;
      }
    }
  };

  /// Update import window read-only addresses state and reference upon address removal.
  const handleAddressRemove = (source: AccountSource, address: string) => {
    switch (source) {
      case 'ledger': {
        setLedgerAddresses((prev: LedgerLocalAddress[]) => {
          const updated = prev.map((a) =>
            a.address === address ? { ...a, isImported: false } : a
          );
          ledgerAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: LocalAddress[]) => {
          const updated = prev.map((a) =>
            a.address === address ? { ...a, isImported: false } : a
          );
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'vault': {
        setVaultAddresses((prev: LocalAddress[]) => {
          const updated = prev.map((a) =>
            a.address === address ? { ...a, isImported: false } : a
          );
          vaultAddressesRef.current = updated;
          return updated;
        });

        break;
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
        isAlreadyImported,
        getAddressesOfSource,
        handleAddressImport,
        handleAddressDelete,
        handleAddressRemove,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
