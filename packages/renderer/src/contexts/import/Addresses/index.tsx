// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as defaults from './defaults';
import { getSupportedSources } from '@polkadot-live/consts/chains';
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
    genericAccounts.get(source) || [];

  /**
   * Fetch stored accounts when component mounts.
   */
  useEffect(() => {
    const fetchAccounts = async () => {
      const map = new Map<AccountSource, ImportedGenericAccount[]>();
      for (const source of getSupportedSources()) {
        const task: IpcTask = { action: 'raw-account:get', data: { source } };
        const result = (await window.myAPI.rawAccountTask(task)) as string;
        map.set(source, JSON.parse(result));
      }
      setStateWithRef(map, setGenericAccounts, genericAccountsRef);
    };

    fetchAccounts();
  }, []);

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

  return (
    <AddressesContext.Provider
      value={{
        getAccounts,
        handleAddressImport,
        handleAddressDelete,
        handleAddressUpdate,
        isAlreadyImported,
        isUniqueAccountName,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
