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
import type { IpcTask } from '@/types/communication';

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
  const handleDeleteAddress = async (
    address: string,
    source: AccountSource
  ): Promise<boolean> => {
    // Remove status entry from account statuses context.
    deleteAccountStatus(address, source);

    let goBack = false;

    if (source === 'vault') {
      goBack = handleDeleteVaultAddress(address);
    } else if (source === 'ledger') {
      goBack = handleDeleteLedgerAddress(address);
    } else if (source === 'read-only') {
      goBack = handleDeleteReadOnlyAddress(address);
    }

    // Update Electron store, delete address data
    await removeAddressFromStore(source, address);

    // Delete in main renderer.
    postAddressDeleteMessage(address);

    return goBack;
  };

  /// Update import window read-only addresses state.
  const handleDeleteReadOnlyAddress = (address: string): boolean => {
    setReadOnlyAddresses((prev: LocalAddress[]) =>
      prev.filter((a) => a.address !== address)
    );

    return false;
  };

  /// Update import window vault addresses state.
  const handleDeleteVaultAddress = (address: string): boolean => {
    let goBack = false;
    setVaultAddresses((prev: LocalAddress[]) => {
      const updated = prev.filter((a) => a.address !== address);
      updated.length === 0 && (goBack = true);
      return updated;
    });

    return goBack;
  };

  /// Update import window ledger addresses state.
  const handleDeleteLedgerAddress = (address: string): boolean => {
    setLedgerAddresses((prev: LedgerLocalAddress[]) =>
      prev.filter((a) => a.address !== address)
    );

    return true;
  };

  /// Remove address entry from store.
  const removeAddressFromStore = async (
    source: AccountSource,
    address: string
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:delete',
      data: { source, address },
    };

    await window.myAPI.rawAccountTask(ipcTask);
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
