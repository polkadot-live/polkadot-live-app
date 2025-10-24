// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useState, useRef, useEffect } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import type { AddressesContextInterface } from '@polkadot-live/contexts/types/main';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  FlattenedAccountData,
  FlattenedAccounts,
} from '@polkadot-live/types/accounts';
import { setStateWithRef } from '@w3ux/utils';

export const AddressesContext = createContext<
  AddressesContextInterface | undefined
>(undefined);

export const useAddresses = createSafeContextHook(
  AddressesContext,
  'AddressesContext'
);

export const AddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Store the currently imported addresses
  const [addresses, setAddresses] = useState<FlattenedAccounts>(new Map());
  const addressesRef = useRef(addresses);

  /// Check if an address exists in imported addresses.
  const addressExists = (address: string, chainId: ChainID) => {
    for (const accounts of addressesRef.current.values()) {
      if (accounts.find((a) => a.address === address && a.chain === chainId)) {
        return true;
      }
    }
    return false;
  };

  /// Get all accounts from database.
  const getAllFlattened = async (): Promise<
    Map<ChainID, FlattenedAccountData[]>
  > => {
    const arr: [ChainID, FlattenedAccountData[]][] = JSON.parse(
      (await chrome.runtime.sendMessage({
        type: 'managedAccounts',
        task: 'getAll',
      })) as string
    );
    const map = new Map<ChainID, FlattenedAccountData[]>(arr);
    return map;
  };

  /// Saves received address as an imported address.
  const importAddress = async (accountName: string, fromBackup = false) => {
    const state = await getAllFlattened();
    setStateWithRef(state, setAddresses, addressesRef);
    if (!fromBackup) {
      console.log(`Todo: ${accountName} notification`);
    }
  };

  /// Removes an imported address.
  const removeAddress = async () => {
    /* empty */
  };

  /// Get current addresses.
  const getAddresses = () => {
    let flattened: FlattenedAccountData[] = [];
    for (const accounts of addressesRef.current.values()) {
      const items = accounts
        .map((a) => getAddress(a.address, a.chain))
        .filter((a) => a !== null) as FlattenedAccountData[];
      flattened = flattened.concat(items);
    }
    return flattened;
  };

  /// Gets an imported address along with its Ledger metadata.
  const getAddress = (address: string, chainId: ChainID) => {
    if (!addresses) {
      return null;
    }
    if (!addressExists(address, chainId)) {
      return null;
    }
    const result: FlattenedAccountData[] = [];
    for (const accounts of addressesRef.current.values()) {
      result.push(...accounts);
    }
    return (
      result.find(
        (account) => account.address === address && account.chain === chainId
      ) ?? null
    );
  };

  /// Get all imported account names.
  const getAllAccounts = (): FlattenedAccountData[] =>
    [...addresses.values()].reduce(
      (acc, as) => acc.concat([...as.map((a) => a)]),
      []
    );

  /// Listen to state messages from background worker.
  useEffect(() => {
    const callback = async (message: AnyData) => {
      if (message.type === 'managedAccounts') {
        switch (message.task) {
          case 'setAccountsState': {
            const { ser }: { ser: string } = message.payload;
            const array: [ChainID, FlattenedAccountData[]][] = JSON.parse(ser);
            const map = new Map<ChainID, FlattenedAccountData[]>(array);
            setStateWithRef(map, setAddresses, addressesRef);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  return (
    <AddressesContext
      value={{
        addresses: addressesRef.current,
        getAddresses,
        addressExists,
        importAddress,
        removeAddress,
        getAddress,
        getAllAccounts,
      }}
    >
      {children}
    </AddressesContext>
  );
};
