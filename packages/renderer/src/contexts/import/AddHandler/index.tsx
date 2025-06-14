// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport, getAddressChainId } from '@polkadot-live/core';
import { createContext, useContext } from 'react';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import type { AddHandlerContextInterface } from './types';
import type { AccountSource } from '@polkadot-live/types/accounts';

export const AddHandlerContext = createContext<AddHandlerContextInterface>(
  defaults.defaultAddHandlerContext
);

export const useAddHandler = () => useContext(AddHandlerContext);

export const AddHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressAdd } = useAddresses();

  /**
   * Update generic account imported to main window.
   */
  const handleAddAddress = async (
    publicKeyHex: string,
    source: AccountSource,
    accountName: string,
    address: string // TODO: Remove
  ) => {
    // Set processing flag for account.
    setStatusForAccount(publicKeyHex, source, true);

    // Update addresses state and references.
    handleAddressAdd(source, publicKeyHex);

    // Update address data in store in main process.
    await updateAddressInStore(source, publicKeyHex, accountName);

    // Process added address in main renderer.
    if (getOnlineMode()) {
      postToMain(address, publicKeyHex, source, accountName);
    }
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
      action: 'raw-account:add',
      data: { accountName, publicKeyHex, source },
    });
  };

  /**
   * Send address data to main renderer to process.
   */
  const postToMain = (
    address: string,
    publicKeyHex: string,
    source: AccountSource,
    accountName: string
  ) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        address,
        chainId: getAddressChainId(address),
        publicKeyHex,
        name: accountName,
        source,
      },
    });
  };

  return (
    <AddHandlerContext.Provider
      value={{
        handleAddAddress,
      }}
    >
      {children}
    </AddHandlerContext.Provider>
  );
};
