// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import * as defaults from './defaults';
import type { AddressesContextInterface } from './types';
import { useContext, createContext, useState, useRef } from 'react';
import type {
  AccountSource,
  FlattenedAccountData,
  FlattenedAccounts,
} from '@/types/accounts';
import type { ChainID } from '@/types/chains';
import { AccountsController } from '@/controller/renderer/AccountsController';

export const AddressesContext = createContext<AddressesContextInterface>(
  defaults.defaultAddressesContext
);

export const useAddresses = () => useContext(AddressesContext);

export const AddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Store the currently imported addresses
  const [addresses, setAddressesState] = useState<FlattenedAccounts>(new Map());
  const addressesRef = useRef(addresses);

  // Setter to update addresses state and ref.
  const setAddresses = (value: FlattenedAccounts) => {
    setStateWithRef(value, setAddressesState, addressesRef);
  };

  // Check if an address exists in imported addresses.
  const addressExists = (address: string) => {
    for (const accounts of addressesRef.current.values()) {
      if (accounts.find((a) => a.address === address)) {
        return true;
      }
    }
    return false;
  };

  // Saves received address as an imported address.
  const importAddress = (
    chain: ChainID,
    source: AccountSource,
    address: string,
    name: string
  ) => {
    // Update accounts state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Have main process send OS notification.
    window.myAPI.newAddressImported(chain, source, address, name);
  };

  // Removes an imported address.
  const removeAddress = (chain: ChainID, address: string) => {
    // Set address state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Remove persisted account from store.
    window.myAPI.removeImportedAccount(address);
  };

  // Get current addresses
  const getAddresses = () => {
    let listAddresses: FlattenedAccountData[] = [];

    for (const accounts of addressesRef.current.values()) {
      const newItems = accounts
        .map((a) => getAddress(a.address))
        .filter((a) => a !== null) as FlattenedAccountData[];

      listAddresses = listAddresses.concat(newItems);
    }

    return listAddresses;
  };

  // Gets an imported address along with its Ledger metadata.
  const getAddress = (address: string) => {
    if (!addresses) {
      return null;
    }
    if (!addressExists(address)) {
      return null;
    }

    const result: FlattenedAccountData[] = [];
    for (const accounts of addressesRef.current.values()) {
      result.push(...accounts);
    }

    return result.find((account) => account.address === address) ?? null;
  };

  return (
    <AddressesContext.Provider
      value={{
        addresses: addressesRef.current,
        setAddresses,
        getAddresses,
        addressExists,
        importAddress,
        removeAddress,
        getAddress,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
