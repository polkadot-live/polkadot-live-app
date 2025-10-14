// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContextHook } from '@polkadot-live/contexts';
import { createContext } from 'react';
import { useAccountStatuses } from '../AccountStatuses';
import { useAddresses } from '../Addresses';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { DeleteHandlerContextInterface } from '@polkadot-live/contexts/types/import';
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
    const payload = { publicKeyHex, source };
    const msg = { type: 'rawAccount', task: 'delete', payload };
    const res = await chrome.runtime.sendMessage(msg);
    console.log(`Remove ${source}:${publicKeyHex}:${res}`);
  };

  /**
   * Send address data to main window to process removal.
   */
  const postToMain = (address: string, chainId: ChainID) => {
    console.log(`Delete ${address}:${chainId}`);
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'removeAddress',
      payload: { address, chainId },
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
