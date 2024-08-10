// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@/config/processes/import';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '../AccountStatuses';
import { getAddressChainId } from '@/renderer/Utils';
import { useAddresses } from '../Addresses';
import type { AddHandlerContextInterface } from './types';
import type { IpcTask } from '@/types/communication';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

export const AddHandlerContext = createContext<AddHandlerContextInterface>(
  defaults.defaultAddHandlerContext
);

export const useAddHandler = () => useContext(AddHandlerContext);

export const AddHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setStatusForAccount } = useAccountStatuses();
  const { setReadOnlyAddresses, setVaultAddresses, setLedgerAddresses } =
    useAddresses();

  /// Exposed function to add an address.
  const handleAddAddress = async (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    // Set processing flag for account.
    setStatusForAccount(address, source, true);

    if (source === 'vault') {
      handleAddVaultAddress(address);
    } else if (source === 'ledger') {
      handleAddLedgerAddress(address);
    } else if (source === 'read-only') {
      handleAddReadOnlyAddress(address);
    }

    // Update address data in store in main process.
    await updateAddressInStore(source, address);

    // Process added address in main renderer.
    postAddressToMainWindow(address, source, accountName);
  };

  /// Update import window read-only addresses state.
  const handleAddReadOnlyAddress = (address: string) => {
    setReadOnlyAddresses((prev: LocalAddress[]) =>
      prev.map((a) => (a.address === address ? { ...a, isImported: true } : a))
    );
  };

  /// Update import window vault addresses state.
  const handleAddVaultAddress = (address: string) => {
    setVaultAddresses((prev: LocalAddress[]) =>
      prev.map((a) => (a.address === address ? { ...a, isImported: true } : a))
    );
  };

  /// Update import window ledger addresses state.
  const handleAddLedgerAddress = (address: string) => {
    setLedgerAddresses((prev: LedgerLocalAddress[]) =>
      prev.map((a) => (a.address === address ? { ...a, isImported: true } : a))
    );
  };

  /// Update address in store.
  const updateAddressInStore = async (
    source: AccountSource,
    address: string
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:add',
      data: { source, address },
    };

    await window.myAPI.rawAccountTask(ipcTask);
  };

  /// Send address data to main renderer to process.
  const postAddressToMainWindow = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        address,
        chainId: getAddressChainId(address),
        name: accountName,
        source,
      },
    });
  };

  return (
    <AddHandlerContext.Provider
      value={{
        handleAddAddress,
      }}
    >
      {children}
    </AddHandlerContext.Provider>
  );
};
