// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@ren/config/processes/import';
import { getAddressChainId } from '@ren/renderer/Utils';
import { createContext, useContext } from 'react';
import { useAddresses } from '@app/contexts/import/Addresses';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { IpcTask } from '@polkadot-live/types/communication';
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
  const { handleAddressRemove } = useAddresses();

  /// Exposed function to remove an address.
  const handleRemoveAddress = async (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    // Update addresses state and references.
    handleAddressRemove(source, address);

    // Update address data in store in main process.
    await updateAddressInStore(source, address, accountName);

    // Process removed address in main renderer.
    postAddressToMainWindow(address);
  };

  /// Update address in store.
  const updateAddressInStore = async (
    source: AccountSource,
    address: string,
    accountName: string
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:remove',
      data: { source, address, name: accountName },
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
