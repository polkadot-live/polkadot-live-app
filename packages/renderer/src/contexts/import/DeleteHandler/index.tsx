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

  /**
   * Permanently delete a generic account.
   */
  const handleDeleteAddress = async (
    publicKeyHex: string,
    source: AccountSource,
    address: string
  ): Promise<boolean> => {
    // Remove status entry from account statuses context.
    deleteAccountStatus(publicKeyHex, source);

    // Update addresses state and references.
    const goBack = handleAddressDelete(source, publicKeyHex);

    // Update Electron store, delete address data
    await removeFromStore(source, publicKeyHex);

    // Delete in main renderer.
    postToMain(address);

    return goBack;
  };

  /**
   * Remove generic account from store.
   */
  const removeFromStore = async (
    source: AccountSource,
    publicKeyHex: string
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:delete',
      data: { publicKeyHex, source },
    };

    await window.myAPI.rawAccountTask(ipcTask);
  };

  /**
   * Send address data to main window to process removal.
   */
  const postToMain = (address: string) => {
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
