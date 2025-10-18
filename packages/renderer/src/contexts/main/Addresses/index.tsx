// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@polkadot-live/core';
import { createContext, useState, useRef, useEffect } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import type { AddressesContextInterface } from '@polkadot-live/contexts/types/main';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  AccountSource,
  FlattenedAccountData,
  FlattenedAccounts,
} from '@polkadot-live/types/accounts';

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
  // Store the currently imported addresses
  const [addresses, setAddresses] = useState<FlattenedAccounts>(new Map());
  const addressesRef = useRef(addresses);

  // Check if an address exists in imported addresses.
  const addressExists = (address: string, chainId: ChainID) => {
    for (const accounts of addressesRef.current.values()) {
      if (accounts.find((a) => a.address === address && a.chain === chainId)) {
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
    AccountsController.syncState();

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
    AccountsController.syncState();

    // Remove persisted account from store.
    await window.myAPI.sendAccountTask({
      action: 'account:remove',
      data: { address, chainId: chain },
    });
  };

  // Get current addresses
  const getAddresses = () => {
    let listAddresses: FlattenedAccountData[] = [];

    for (const accounts of addressesRef.current.values()) {
      const newItems = accounts
        .map((a) => getAddress(a.address, a.chain))
        .filter((a) => a !== null) as FlattenedAccountData[];

      listAddresses = listAddresses.concat(newItems);
    }

    return listAddresses;
  };

  // Gets an imported address along with its Ledger metadata.
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

  /// Get subscription count for address.
  const getSubscriptionCountForAccount = (
    flattened: FlattenedAccountData
  ): number => {
    const { address, chain } = flattened;
    const account = AccountsController.get(chain, address);
    if (!account) {
      return 0;
    }

    const tasks = account.getSubscriptionTasks();
    if (!tasks) {
      return 0;
    }

    return tasks.length;
  };

  /// Get total subscription count.
  const getTotalSubscriptionCount = (): number =>
    getAllAccounts().reduce(
      (acc, flattened) => acc + getSubscriptionCountForAccount(flattened),
      0
    );

  // Cache addresses state setter in controller for updaing UI.
  useEffect(() => {
    AccountsController.cachedSetAddresses = setAddresses;
    AccountsController.cachedAddressesRef = addressesRef;
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
        getSubscriptionCountForAccount,
        getTotalSubscriptionCount,
      }}
    >
      {children}
    </AddressesContext>
  );
};
