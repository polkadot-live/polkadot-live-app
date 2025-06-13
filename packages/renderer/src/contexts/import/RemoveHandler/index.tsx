// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport, getAddressChainId } from '@polkadot-live/core';
import { createContext, useContext } from 'react';
import { useAddresses } from '@ren/contexts/import';
import type { AccountSource } from '@polkadot-live/types/accounts';
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
  const { handleAddressRemove } = useAddresses();

  /**
   * Removed generic account from main window.
   */
  const handleRemoveAddress = async (
    publicKeyHex: string,
    source: AccountSource,
    accountName: string,
    address: string
  ) => {
    // Update addresses state and references.
    handleAddressRemove(source, publicKeyHex);

    // Update address data in store in main process.
    await updateAddressInStore(source, publicKeyHex, accountName);

    // Process removed address in main renderer.
    postToMain(address);
  };

  /**
   * Update address in store.
   */
  const updateAddressInStore = async (
    source: AccountSource,
    publicKeyHex: string,
    accountName: string
  ) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:remove',
      data: { accountName, publicKeyHex, source },
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
