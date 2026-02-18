// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext } from 'react';
import { createSafeContextHook } from '../../../utils';
import { useImportAddresses } from '../Addresses';
import { getRemoveHandlerAdapter } from './adapters';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { RemoveHandlerContextInterface } from '../../../types/import';

export const RemoveHandlerContext = createContext<
  RemoveHandlerContextInterface | undefined
>(undefined);

export const useRemoveHandler = createSafeContextHook(
  RemoveHandlerContext,
  'RemoveHandlerContext',
);

export const RemoveHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getRemoveHandlerAdapter();
  const { handleAddressUpdate } = useImportAddresses();

  /**
   * Removed generic account from main window.
   */
  const handleRemoveAddress = async (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount,
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
    await adapter.updateAddressInStore(account);
  };

  /**
   * Send address data to background worker or main process to process removal.
   */
  const postToMain = (address: string, chainId: ChainID) => {
    adapter.postToMain(address, chainId);
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
