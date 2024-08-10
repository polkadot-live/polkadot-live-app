// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@/config/processes/import';
import { getAddressChainId } from '@/renderer/Utils';
import { createContext, useContext } from 'react';
import { useAddresses } from '@app/contexts/import/Addresses';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { IpcTask } from '@/types/communication';
import type { RemoveHandlerContextInterface } from './types';

export const RemoveHandlerContext =
  createContext<RemoveHandlerContextInterface>(
    defaults.defaultRemoveHandlerContext
  );

export const useRemoveHandler = () => useContext(RemoveHandlerContext);

export const RemoveHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setReadOnlyAddresses, setVaultAddresses, setLedgerAddresses } =
    useAddresses();

  /// Exposed function to remove an address.
  const handleRemoveAddress = async (
    address: string,
    source: AccountSource
  ) => {
    if (source === 'vault') {
      handleRemoveVaultAddress(address);
    } else if (source === 'ledger') {
      handleRemoveLedgerAddress(address);
    } else if (source === 'read-only') {
      handleRemoveReadOnlyAddress(address);
    }

    // Update address data in store in main process.
    await updateAddressInStore(source, address);

    // Process removed address in main renderer.
    postAddressToMainWindow(address);
  };

  /// Update import window read-only addresses state.
  const handleRemoveReadOnlyAddress = (address: string) => {
    setReadOnlyAddresses((prev: LocalAddress[]) =>
      prev.map((a) => (a.address === address ? { ...a, isImported: false } : a))
    );
  };

  /// Update import window vault addresses state.
  const handleRemoveVaultAddress = (address: string) => {
    setVaultAddresses((prev: LocalAddress[]) =>
      prev.map((a) => (a.address === address ? { ...a, isImported: false } : a))
    );
  };

  /// Update import window ledger addresses state.
  const handleRemoveLedgerAddress = (address: string) => {
    setLedgerAddresses((prev: LedgerLocalAddress[]) =>
      prev.map((a) => (a.address === address ? { ...a, isImported: false } : a))
    );
  };

  /// Update address in store.
  const updateAddressInStore = async (
    source: AccountSource,
    address: string
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:remove',
      data: { source, address },
    };

    await window.myAPI.rawAccountTask(ipcTask);
  };

  /// Send address data to main window to process removal.
  const postAddressToMainWindow = (address: string) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:remove',
      data: {
        address,
        chainId: getAddressChainId(address),
      },
    });
  };

  return (
    <RemoveHandlerContext.Provider
      value={{
        handleRemoveAddress,
      }}
    >
      {children}
    </RemoveHandlerContext.Provider>
  );
};
