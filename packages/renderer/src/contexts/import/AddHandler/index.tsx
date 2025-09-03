// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { createContext } from 'react';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import type { AddHandlerContextInterface } from './types';
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
    await window.myAPI.rawAccountTask({
      action: 'raw-account:update',
      data: { serialized: JSON.stringify(account) },
    });
  };

  /**
   * Send address data to main renderer to process.
   */
  const postToMain = (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount
  ) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        serEncodedAccount: JSON.stringify(encodedAccount),
        serGenericAccount: JSON.stringify(genericAccount),
      },
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
