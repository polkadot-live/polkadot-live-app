// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport, getAddressChainId } from '@polkadot-live/core';
import { createContext, useContext } from 'react';
import { useAddresses } from '@ren/contexts/import';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
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
    postToMain(address);
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
  const postToMain = (address: string) => {
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
