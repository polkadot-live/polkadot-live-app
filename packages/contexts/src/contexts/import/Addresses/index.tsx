// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getImportAddressesAdapter } from './adapters';
import { getSupportedSources } from '@polkadot-live/consts/chains';
import { setStateWithRef } from '@w3ux/utils';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ImportAddressesContextInterface } from '../../../types/import';

export const ImportAddressesContext = createContext<
  ImportAddressesContextInterface | undefined
>(undefined);

export const useImportAddresses = createSafeContextHook(
  ImportAddressesContext,
  'ImportAddressesContext'
);

export const ImportAddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getImportAddressesAdapter();

  /**
   * Generic accounts map and reference.
   */
  const [genericAccounts, setGenericAccounts] = useState(
    new Map<AccountSource, ImportedGenericAccount[]>()
  );
  const genericAccountsRef = useRef(genericAccounts);

  /**
   * Get accounts according to import source.
   */
  const getAccounts = (source: AccountSource): ImportedGenericAccount[] =>
    genericAccountsRef.current.get(source) || [];

  /**
   * Check if an address has already been imported.
   */
  const isAlreadyImported = (targetPubKeyHex: string): boolean => {
    const all = Array.from(genericAccountsRef.current.values()).flat();
    const pks = all.map(({ publicKeyHex }) => publicKeyHex);
    return pks.includes(targetPubKeyHex);
  };

  /**
   * Update account state and reference upon address import.
   */
  const handleAddressImport = (genericAccount: ImportedGenericAccount) => {
    const { publicKeyHex, source } = genericAccount;
    const updated = (genericAccountsRef.current.get(source) || [])
      .filter(({ publicKeyHex: pk }) => pk !== publicKeyHex)
      .concat([{ ...genericAccount }]);
    const map = new Map(genericAccountsRef.current).set(source, updated);
    setStateWithRef(map, setGenericAccounts, genericAccountsRef);
  };

  /**
   * Update account state and reference upon address deletion.
   */
  const handleAddressDelete = (
    genericAccount: ImportedGenericAccount
  ): boolean => {
    const { publicKeyHex, source } = genericAccount;
    const updated = (genericAccountsRef.current.get(source) || []).filter(
      ({ publicKeyHex: pk }) => publicKeyHex !== pk
    );
    const map = new Map(genericAccountsRef.current).set(source, updated);
    const goBack = source === 'read-only' ? false : updated.length === 0;
    setStateWithRef(map, setGenericAccounts, genericAccountsRef);
    return goBack;
  };

  /**
   * Update account state and reference upon account add or remove.
   */
  const handleAddressUpdate = (genericAccount: ImportedGenericAccount) => {
    const { publicKeyHex, source } = genericAccount;
    const updated = (genericAccountsRef.current.get(source) || []).map((a) =>
      a.publicKeyHex === publicKeyHex ? genericAccount : a
    );
    const map = new Map(genericAccountsRef.current).set(source, updated);
    setStateWithRef(map, setGenericAccounts, genericAccountsRef);
  };

  /**
   * Check for duplicate account name.
   */
  const isUniqueAccountName = (target: string): boolean => {
    for (const s of getSupportedSources()) {
      const found = getAccounts(s).find(
        ({ accountName }) => accountName === target
      );
      if (found) {
        return false;
      }
    }
    return true;
  };

  /**
   * Get a default account name.
   */
  const getDefaultName = (): string => {
    let total = getSupportedSources()
      .map((s) => getAccounts(s).length)
      .reduce((acc, cur) => acc + cur, 1);

    let nextName = `Account ${total}`;
    while (!isUniqueAccountName(nextName) || !isUniqueNamePrefix(nextName)) {
      total += 1;
      nextName = `Account ${total}`;
    }

    return nextName;
  };

  /**
   * Check if the `Account {n}` prefix is unique.
   */
  const isUniqueNamePrefix = (nextName: string) => {
    for (const source of getSupportedSources()) {
      for (const { encodedAccounts } of getAccounts(source)) {
        for (const { alias } of Object.values(encodedAccounts)) {
          if (alias.startsWith(nextName)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  /**
   * Get next `n` account names.
   */
  const getNextNames = (len: number): string[] => {
    const accountNames: string[] = [];
    let uniqueName = getDefaultName();

    Array.from({ length: len }, (_, i) => {
      if (i > 0) {
        let n = parseInt(uniqueName.split(' ').pop()!) + 1;
        while (!isUniqueAccountName(`Account ${n}`)) {
          n += 1;
        }
        uniqueName = `Account ${n}`;
      }
      accountNames.push(uniqueName);
    });

    return accountNames;
  };

  /**
   * Fetch stored accounts when component mounts.
   */
  useEffect(() => {
    const fetchAccounts = async () => {
      const map = await adapter.fetchOnMount();
      setStateWithRef(map, setGenericAccounts, genericAccountsRef);
    };
    fetchAccounts();
  }, []);

  /**
   * Listen for state syncing messages.
   */
  useEffect(() => {
    const removeListener = adapter.listenOnMount(
      setGenericAccounts,
      genericAccountsRef
    );
    return () => {
      removeListener && removeListener();
    };
  }, []);

  return (
    <ImportAddressesContext
      value={{
        getAccounts,
        getDefaultName,
        getNextNames,
        handleAddressImport,
        handleAddressDelete,
        handleAddressUpdate,
        isAlreadyImported,
        isUniqueAccountName,
      }}
    >
      {children}
    </ImportAddressesContext>
  );
};
