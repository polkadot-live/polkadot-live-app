// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import * as defaults from './defaults';
import type { AddressesContextInterface } from './types';
import { useContext, createContext, useState, useRef } from 'react';
import type { ChainID } from '@/types/chains';
import type {
  AccountSource,
  FlattenedAccountData,
  FlattenedAccounts,
} from '@/types/accounts';
import { AccountsController } from '@/renderer/static/AccountsController';
import { fetchNominationPoolDataForAccount } from '@/utils/AccountUtils';

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
    /**
     *
     * TODO:
     *
     * - Send new address data to main window via message ports.
     * - Have main window update controllers etc.
     * - Send response back to import window to update its UI.
     *
     * This needs to be done because the `menu` window houses the API
     * instances, and we don't want to create more than one API instance
     * for a single chain.
     */

    // The following logic has been copied from the main process in
    // preparation for the ports refactor.

    // Add address to `AccountsController`.
    const account = AccountsController.add(chain, source, address, name);

    // If account was unsuccessfully added, exit early.
    if (!account) {
      return;
    }

    // Initialize nomination pool data for account if necessary.
    fetchNominationPoolDataForAccount(account, chain);

    // Update accounts state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Have main process send OS notification.
    window.myAPI.newAddressImported(chain, source, address, name);
  };

  // Removes an imported address.
  const removeAddress = async (chain: ChainID, address: string) => {
    /**
     *
     * TODO:
     *
     * - Send address data to main window via message ports.
     * - Have main window update controllers etc.
     * - Send response back to import window to update its UI.
     *
     * This needs to be done because the `menu` window houses the API
     * instances, and we don't want to create more than one API instance
     * for a single chain.
     */

    // The following logic has been copied from the main process in
    // preparation for the ports refactor.

    // Retrieve the account.
    const account = AccountsController.get(chain, address);

    if (!account) {
      return;
    }

    // Unsubscribe from all active tasks.
    await AccountsController.removeAllSubscriptions(account);

    // Remove account from controller and store.
    AccountsController.remove(chain, address);

    // Set account subscriptions data for rendering.
    //setAccountSubscriptions(
    //  SubscriptionsController.getAccountSubscriptions(
    //    AccountsController.accounts
    //  )
    //);

    // Set address state.
    //setAddresses(AccountsController.getAllFlattenedAccountData());

    // Report chain connections to UI.
    // TODO

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
