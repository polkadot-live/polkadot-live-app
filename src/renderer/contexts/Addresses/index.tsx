// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Keyring from '@polkadot/keyring';
import { setStateWithRef } from '@polkadot-cloud/utils';
import { Account } from '@/model/Account';
import * as defaults from './defaults';
import { AddressesContextInterface } from './types';
import { AccountSource, ImportedAccounts } from '@polkadot-live/types';
import { useContext, createContext, useState, useRef } from 'react';
import { ChainID } from '@polkadot-live/types/chains';

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
  const [addresses, setAddressesState] = useState<ImportedAccounts>({});
  const addressesRef = useRef(addresses);

  // Setter to update addresses state and ref.
  const setAddresses = (value: ImportedAccounts) => {
    setStateWithRef(value, setAddressesState, addressesRef);
  };

  // Check if an address exists in imported addresses.
  const addressExists = (address: string) =>
    Object.values({ ...addressesRef.current }).find((items) =>
      items.find((a) => a.address === address)
    ) !== undefined;

  // Saves a Ledger address as an imported address.
  const importAddress = (
    chain: ChainID,
    source: AccountSource,
    address: string,
    name: string
  ) => {
    window.myAPI.newAddressImported(chain, source, address, name);
  };

  // Removes a Ledger address as an imported address.
  const removeAddress = (chain: ChainID, address: string) => {
    window.myAPI.removeImportedAccount(chain, address);
  };

  // Get current addresses
  const getAddresses = () => {
    let listAddresses: Account[] = [];
    Object.values(addresses).forEach((items) => {
      const newItems = items
        .map((account) => getAddress(account.address))
        .filter((a) => a !== null) as Account[];
      listAddresses = listAddresses.concat(newItems);
    });
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

    const result: Account[] = [];
    Object.values(addressesRef.current).forEach((accounts) => {
      result.push(...accounts);
    });

    return result.find((account) => account.address === address) ?? null;
  };

  // formats an address into the currently active network's ss58 format.
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
