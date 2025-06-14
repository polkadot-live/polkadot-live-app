// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as defaults from './defaults';
import { setStateWithRef } from '@w3ux/utils';
import type { AddressesContextInterface } from './types';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { IpcTask } from '@polkadot-live/types/communication';

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
  type IGA = ImportedGenericAccount;

  /// Addresses state.
  const [ledgerAddresses, setLedgerAddresses] = useState<IGA[]>([]);
  const [readOnlyAddresses, setReadOnlyAddresses] = useState<IGA[]>([]);
  const [vaultAddresses, setVaultAddresses] = useState<IGA[]>([]);
  const [wcAddresses, setWcAddresses] = useState<IGA[]>([]);

  /// References to addresses state.
  const ledgerAddressesRef = useRef<IGA[]>([]);
  const readOnlyAddressesRef = useRef<IGA[]>([]);
  const vaultAddressesRef = useRef<IGA[]>([]);
  const wcAddressesRef = useRef<IGA[]>([]);

  /// Get accounts according to import source.
  const getAccounts = (source: AccountSource): ImportedGenericAccount[] => {
    switch (source) {
      case 'ledger':
        return ledgerAddresses;
      case 'read-only':
        return readOnlyAddresses;
      case 'wallet-connect':
        return wcAddresses;
      case 'vault':
        return vaultAddresses;
      default:
        return [];
    }
  };

  /// Fetch address data from store when component loads.
  useEffect(() => {
    const fetchAccounts = async () => {
      const sources: AccountSource[] = [
        'ledger',
        'read-only',
        'vault',
        'wallet-connect',
      ];

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
        window.myAPI.rawAccountTask(tasks[3]),
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

      setStateWithRef(
        JSON.parse(results[3] as string),
        setWcAddresses,
        wcAddressesRef
      );
    };

    fetchAccounts();
  }, []);

  /// Check if an address has already been imported.
  const isAlreadyImported = (targetPubKeyHex: string): boolean => {
    const checkAll = <T extends { publicKeyHex: string }>(
      items: T[],
      target: string
    ): boolean =>
      items.reduce(
        (acc, { publicKeyHex }) =>
          acc ? acc : publicKeyHex === target ? true : false,
        false
      );

    return (
      checkAll(ledgerAddressesRef.current, targetPubKeyHex) ||
      checkAll(vaultAddressesRef.current, targetPubKeyHex) ||
      checkAll(readOnlyAddressesRef.current, targetPubKeyHex) ||
      checkAll(wcAddressesRef.current, targetPubKeyHex)
    );
  };

  /// Update import window read-only addresses state and reference upon address import.
  const handleAddressImport = (genericAccount: ImportedGenericAccount) => {
    switch (genericAccount.source) {
      case 'ledger': {
        setLedgerAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev
            .filter((a) => a.publicKeyHex !== genericAccount.publicKeyHex)
            .concat([{ ...genericAccount }]);
          ledgerAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev
            .filter((a) => a.publicKeyHex !== genericAccount.publicKeyHex)
            .concat([{ ...genericAccount }]);
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'vault': {
        setVaultAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev
            .filter((a) => a.publicKeyHex !== genericAccount.publicKeyHex)
            .concat([{ ...genericAccount }]);
          vaultAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'wallet-connect': {
        setWcAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev
            .filter((a) => a.publicKeyHex !== genericAccount.publicKeyHex)
            .concat([{ ...genericAccount }]);
          wcAddressesRef.current = updated;
          return updated;
        });

        break;
      }
    }
  };

  /// Update import window read-only addresses state and reference upon address deletion.
  const handleAddressDelete = (
    source: AccountSource,
    publicKeyHex: string
  ): boolean => {
    switch (source) {
      case 'ledger': {
        let goBack = false;
        setLedgerAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.filter((a) => a.publicKeyHex !== publicKeyHex);
          ledgerAddressesRef.current = updated;
          updated.length === 0 && (goBack = true);
          return updated;
        });

        return goBack;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.filter((a) => a.publicKeyHex !== publicKeyHex);
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        return false;
      }
      case 'vault': {
        let goBack = false;
        setVaultAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.filter((a) => a.publicKeyHex !== publicKeyHex);
          vaultAddressesRef.current = updated;
          updated.length === 0 && (goBack = true);
          return updated;
        });

        return goBack;
      }
      case 'wallet-connect': {
        let goBack = false;
        setWcAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.filter((a) => a.publicKeyHex !== publicKeyHex);
          wcAddressesRef.current = updated;
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
  const handleAddressRemove = (source: AccountSource, publicKeyHex: string) => {
    switch (source) {
      case 'ledger': {
        setLedgerAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: false } : a
          );
          ledgerAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: false } : a
          );
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'vault': {
        setVaultAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: false } : a
          );
          vaultAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'wallet-connect': {
        setWcAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: false } : a
          );
          wcAddressesRef.current = updated;
          return updated;
        });

        break;
      }
    }
  };

  /// Update import window read-only addresses state and reference upon address addition.
  const handleAddressAdd = (source: AccountSource, publicKeyHex: string) => {
    switch (source) {
      case 'ledger': {
        setLedgerAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: true } : a
          );
          ledgerAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'read-only': {
        setReadOnlyAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: true } : a
          );
          readOnlyAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'vault': {
        setVaultAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: true } : a
          );
          vaultAddressesRef.current = updated;
          return updated;
        });

        break;
      }
      case 'wallet-connect': {
        setWcAddresses((prev: ImportedGenericAccount[]) => {
          const updated = prev.map((a) =>
            a.publicKeyHex === publicKeyHex ? { ...a, isImported: true } : a
          );
          wcAddressesRef.current = updated;
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
        wcAddresses,
        getAccounts,
        handleAddressImport,
        handleAddressDelete,
        handleAddressRemove,
        handleAddressAdd,
        isAlreadyImported,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
