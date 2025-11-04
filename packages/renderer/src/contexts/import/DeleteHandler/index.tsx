// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContextHook, useAddresses } from '@polkadot-live/contexts';
import { ConfigImport } from '@polkadot-live/core';
import { createContext } from 'react';
import { useAccountStatuses } from '../AccountStatuses';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { DeleteHandlerContextInterface } from '@polkadot-live/contexts/types/import';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { ChainID } from '@polkadot-live/types/chains';

export const DeleteHandlerContext = createContext<
  DeleteHandlerContextInterface | undefined
>(undefined);

export const useDeleteHandler = createSafeContextHook(
  DeleteHandlerContext,
  'DeleteHandlerContext'
);

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
    genericAccount: ImportedGenericAccount
  ): Promise<boolean> => {
    const { publicKeyHex, source } = genericAccount;
    let goBack = false;

    for (const { address, chainId } of Object.values(
      genericAccount.encodedAccounts
    )) {
      deleteAccountStatus(`${chainId}:${address}`, source);
      if (!goBack) {
        goBack = handleAddressDelete(genericAccount);
      }

      // Delete in main renderer.
      postToMain(address, chainId);
    }

    // Delete all account data from store.
    await removeFromStore(source, publicKeyHex);
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
  const postToMain = (address: string, chainId: ChainID) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:delete',
      data: { address, chainId },
    });
  };

  return (
    <DeleteHandlerContext
      value={{
        handleDeleteAddress,
      }}
    >
      {children}
    </DeleteHandlerContext>
  );
};
