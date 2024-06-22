// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@/config/processes/import';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '../AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { getAddressChainId } from '@/renderer/Utils';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { DeleteHandlerContextInterface } from './types';

export const DeleteHandlerContext =
  createContext<DeleteHandlerContextInterface>(
    defaults.defaultDeleteHandlerContext
  );

export const useDeleteHandler = () => useContext(DeleteHandlerContext);

export const DeleteHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { deleteAccountStatus } = useAccountStatuses();
  const { setReadOnlyAddresses, setVaultAddresses, setLedgerAddresses } =
    useAddresses();

  /// Exposed function to delete an address.
  const handleDeleteAddress = (
    address: string,
    source: AccountSource
  ): boolean => {
    // Remove status entry from account statuses context.
    deleteAccountStatus(address, source);

    let goBack = false;

    if (source === 'vault') {
      goBack = handleDeleteVaultAddress(address, source);
    } else if (source === 'ledger') {
      goBack = handleDeleteLedgerAddress(address, source);
    } else if (source === 'read-only') {
      goBack = handleDeleteReadOnlyAddress(address, source);
    }

    return goBack;
  };

  /// Handle deletion of a read-only address.
  const handleDeleteReadOnlyAddress = (
    address: string,
    source: AccountSource
  ): boolean => {
    // Update import window's managed address state and local storage.
    setReadOnlyAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.filter(
        (a: LocalAddress) => a.address !== address
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressDeleteMessage(address);
    return false;
  };

  /// Handle deletion of a vault address.
  const handleDeleteVaultAddress = (
    address: string,
    source: AccountSource
  ): boolean => {
    let goBack = false;

    // Update import window's managed address state and local storage.
    setVaultAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.filter(
        (a: LocalAddress) => a.address !== address
      );

      newAddresses.length === 0 && (goBack = true);

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressDeleteMessage(address);
    return goBack;
  };

  /// Handle deletion of a ledger address.
  const handleDeleteLedgerAddress = (
    address: string,
    source: AccountSource
  ): boolean => {
    // Update import window's managed address state and local storage.
    setLedgerAddresses((prevState: LedgerLocalAddress[]) => {
      const newAddresses = prevState.filter(
        (a: LedgerLocalAddress) => a.address !== address
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressDeleteMessage(address);
    return false;
  };

  /// Send address data to main window to process removal.
  const postAddressDeleteMessage = (address: string) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:delete',
      data: {
        address,
        chainId: getAddressChainId(address),
      },
    });
  };

  return (
    <DeleteHandlerContext.Provider
      value={{
        handleDeleteAddress,
      }}
    >
      {children}
    </DeleteHandlerContext.Provider>
  );
};
