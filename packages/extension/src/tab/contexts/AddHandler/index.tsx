// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  createSafeContextHook,
  useAccountStatuses,
  useAddresses,
  useConnections,
} from '@polkadot-live/contexts';
import { createContext } from 'react';
import type { AddHandlerContextInterface } from '@polkadot-live/contexts/types/import';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export const AddHandlerContext = createContext<
  AddHandlerContextInterface | undefined
>(undefined);

export const useAddHandler = createSafeContextHook(
  AddHandlerContext,
  'AddHandlerContext'
);

export const AddHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressUpdate } = useAddresses();

  /**
   * Update generic account imported to main window.
   */
  const handleAddAddress = async (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount
  ) => {
    const { address, chainId } = encodedAccount;
    const { encodedAccounts, source } = genericAccount;
    encodedAccounts[chainId].isImported = true;

    // Set processing flag for account.
    setStatusForAccount(`${chainId}:${address}`, source, true);

    // Update React state and store.
    handleAddressUpdate(genericAccount);
    await updateAddressInStore(genericAccount);

    // Process added address in main renderer.
    if (getOnlineMode()) {
      postToMain(encodedAccount, genericAccount);
    }
  };

  /**
   * Update account when bookmark flag toggled.
   */
  const handleBookmarkToggle = async (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount
  ) => {
    const { chainId, isBookmarked } = encodedAccount;
    encodedAccount.isBookmarked = !isBookmarked;
    genericAccount.encodedAccounts[chainId] = encodedAccount;

    // Update React state and store.
    handleAddressUpdate(genericAccount);
    await updateAddressInStore(genericAccount);
  };

  /**
   * Update address in store.
   */
  const updateAddressInStore = async (account: ImportedGenericAccount) => {
    const msg = { type: 'rawAccount', task: 'update', payload: { account } };
    const res = await chrome.runtime.sendMessage(msg);
    console.log(`Update ${account.accountName}: ${res}`);
  };

  /**
   * Send address data to main renderer to process.
   */
  const postToMain = (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount
  ) => {
    console.log(`Import ${genericAccount.accountName}:${encodedAccount.alias}`);
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'importAddress',
      payload: { encodedAccount, genericAccount },
    });
  };

  return (
    <AddHandlerContext
      value={{
        handleAddAddress,
        handleBookmarkToggle,
      }}
    >
      {children}
    </AddHandlerContext>
  );
};
