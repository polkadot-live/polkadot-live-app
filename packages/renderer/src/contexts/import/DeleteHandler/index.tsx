// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport, getAddressChainId } from '@polkadot-live/core';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '../AccountStatuses';
import { useAddresses } from '@ren/contexts/import';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { DeleteHandlerContextInterface } from './types';
import type { IpcTask } from '@polkadot-live/types/communication';

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
  const { handleAddressDelete } = useAddresses();

  /// Exposed function to delete an address.
  const handleDeleteAddress = async (
    address: string,
    source: AccountSource
  ): Promise<boolean> => {
    // Remove status entry from account statuses context.
    deleteAccountStatus(address, source);

    // Update addresses state and references.
    const goBack = handleAddressDelete(source, address);

    // Update Electron store, delete address data
    await removeAddressFromStore(source, address);

    // Delete in main renderer.
    postAddressDeleteMessage(address);

    return goBack;
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
