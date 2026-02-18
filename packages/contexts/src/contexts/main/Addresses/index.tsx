// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getAddressesAdapter } from './adapters';
import type {
  FlattenedAccountData,
  FlattenedAccounts,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AddressesContextInterface } from '../../../types/main';

export const AddressesContext = createContext<
  AddressesContextInterface | undefined
>(undefined);

export const useAddresses = createSafeContextHook(
  AddressesContext,
  'AddressesContext',
);

export const AddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getAddressesAdapter();

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

  /// Saves received address as an imported address.
  const importAddress = async (accountName: string, fromBackup = false) => {
    await adapter.importAddress(
      accountName,
      fromBackup,
      addressesRef,
      setAddresses,
    );
  };

  /// Removes an imported address.
  const removeAddress = async (chainId: ChainID, address: string) => {
    adapter.removeAddress(chainId, address);
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
        (account) => account.address === address && account.chain === chainId,
      ) ?? null
    );
  };

  /// Get all imported account names.
  const getAllAccounts = (): FlattenedAccountData[] =>
    [...addresses.values()].reduce(
      (acc, as) => acc.concat([...as.map((a) => a)]),
      [],
    );

  /// Cache functions on mount (electron).
  useEffect(() => {
    adapter.onMount(addressesRef, setAddresses);
  }, []);

  /// Listen to state messages from background worker.
  useEffect(() => {
    const removeListener = adapter.listenOnMount(addressesRef, setAddresses);
    return () => {
      removeListener?.();
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
