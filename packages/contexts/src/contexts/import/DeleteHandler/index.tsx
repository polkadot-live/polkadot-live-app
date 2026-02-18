// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext } from 'react';
import { createSafeContextHook } from '../../../utils';
import { useAccountStatuses } from '../AccountStatuses';
import { useImportAddresses } from '../Addresses';
import { getDeleteHandlerAdapter } from './adapters';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { DeleteHandlerContextInterface } from '../../../types/import';

export const DeleteHandlerContext = createContext<
  DeleteHandlerContextInterface | undefined
>(undefined);

export const useDeleteHandler = createSafeContextHook(
  DeleteHandlerContext,
  'DeleteHandlerContext',
);

export const DeleteHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getDeleteHandlerAdapter();
  const { deleteAccountStatus } = useAccountStatuses();
  const { handleAddressDelete } = useImportAddresses();

  /**
   * Permanently delete a generic account.
   */
  const handleDeleteAddress = async (
    genericAccount: ImportedGenericAccount,
  ): Promise<boolean> => {
    const { publicKeyHex, source } = genericAccount;
    let goBack = false;

    for (const { address, chainId } of Object.values(
      genericAccount.encodedAccounts,
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
  const removeFromStore = async (source: AccountSource, publicKeyHex: string) =>
    await adapter.removeFromStore(source, publicKeyHex);

  /**
   * Send address data to main window to process removal.
   */
  const postToMain = (address: string, chainId: ChainID) =>
    adapter.postToMain(address, chainId);

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
