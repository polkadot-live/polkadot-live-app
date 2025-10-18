// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import { createContext } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { useAddresses } from '@ren/contexts/import';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { RemoveHandlerContextInterface } from '@polkadot-live/contexts/types/import';

export const RemoveHandlerContext = createContext<
  RemoveHandlerContextInterface | undefined
>(undefined);

export const useRemoveHandler = createSafeContextHook(
  RemoveHandlerContext,
  'RemoveHandlerContext'
);

export const RemoveHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { handleAddressUpdate } = useAddresses();

  /**
   * Removed generic account from main window.
   */
  const handleRemoveAddress = async (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount
  ) => {
    const { address, chainId } = encodedAccount;
    genericAccount.encodedAccounts[chainId].isImported = false;

    // Update React state and store.
    handleAddressUpdate(genericAccount);
    await updateAddressInStore(genericAccount);

    // Process removed address in main renderer.
    postToMain(address, chainId);
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
   * Send address data to main window to process removal.
   */
  const postToMain = (address: string, chainId: ChainID) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:remove',
      data: { address, chainId },
    });
  };

  return (
    <RemoveHandlerContext
      value={{
        handleRemoveAddress,
      }}
    >
      {children}
    </RemoveHandlerContext>
  );
};
