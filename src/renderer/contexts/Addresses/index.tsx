// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import Keyring from '@polkadot/keyring';
import { setStateWithRef } from '@polkadot-cloud/utils';
import * as defaults from './defaults';
import type { AddressesContextInterface } from './types';
import { useContext, createContext, useState, useRef } from 'react';
import type { ChainID } from '@/types/chains';
import type {
  AccountSource,
  FlattenedAccountData,
  FlattenedAccounts,
} from '@/types/accounts';

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
    window.myAPI.newAddressImported(chain, source, address, name);
  };

  // Removes an imported address.
  const removeAddress = (chain: ChainID, address: string) => {
    window.myAPI.removeImportedAccount(chain, address);
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

  /**
   * @summary Formats an address into the currently active network's ss58 format.
   * @deprecated Keyring no longer used in favour of @polkadot/util-crypto functions.
   */
  const formatAccountSs58 = (address: string, format: number) => {
    try {
      const keyring = new Keyring();
      keyring.setSS58Format(format);
      const formatted = keyring.addFromAddress(address).address;
      if (formatted !== address) {
        return formatted;
      }
      return null;
    } catch (e) {
      return null;
    }
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
        formatAccountSs58,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
