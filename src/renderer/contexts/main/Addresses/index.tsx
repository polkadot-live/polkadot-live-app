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
  const importAddress = async (
    chain: ChainID,
    source: AccountSource,
    address: string,
    name: string,
    fromBackup = false
  ) => {
    // Update accounts state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Show OS notification for new address imports.
    if (!fromBackup) {
      await window.myAPI.sendAccountTask({
        action: 'account:import',
        data: {
          chainId: chain,
          source,
          address,
          name,
        },
      });
    }
  };

  // Removes an imported address.
  const removeAddress = async (chain: ChainID, address: string) => {
    // Set address state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Remove persisted account from store.
    await window.myAPI.sendAccountTask({
      action: 'account:remove',
      data: { address },
    });
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

  /// Get addresses count by chain ID.
  const getAddressesCountByChain = (chainId?: ChainID): number =>
    addresses.size === 0
      ? 0
      : chainId === undefined
        ? addresses.values().reduce((acc, as) => acc + as.length, 0)
        : addresses.get(chainId)?.length || 0;

  /// Get addresses count by import method.
  const getAddressesCountBySource = (target: AccountSource): number =>
    addresses
      .values()
      .reduce(
        (acc, as) =>
          acc +
          as.reduce(
            (accIn, { source }) => (source === target ? accIn + 1 : accIn),
            0
          ),
        0
      );

  /// Get all account sources.
  const getAllAccountSources = (): AccountSource[] => [
    'ledger',
    'read-only',
    'vault',
  ];

  const getReadableAccountSource = (source: AccountSource): string => {
    switch (source) {
      case 'ledger': {
        return 'Ledger';
      }
      case 'read-only': {
        return 'Read Only';
      }
      case 'vault': {
        return 'Vault';
      }
      case 'system': {
        return 'System';
      }
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
        getAddressesCountByChain,
        getAddressesCountBySource,
        getAllAccountSources,
        getReadableAccountSource,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
