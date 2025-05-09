// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport, getAddressChainId } from '@polkadot-live/core';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '@ren/contexts/import/AccountStatuses';
import { useAddresses } from '@ren/contexts/import/Addresses';
import { useConnections } from '@ren/contexts/common/Connections';
import type { AddHandlerContextInterface } from './types';
import type { IpcTask } from '@polkadot-live/types/communication';
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

  /// Exposed function to add an address.
  const handleAddAddress = async (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    // Set processing flag for account.
    setStatusForAccount(address, source, true);

    // Update addresses state and references.
    handleAddressAdd(source, address);

    // Update address data in store in main process.
    await updateAddressInStore(source, address, accountName);

    // Process added address in main renderer.
    if (getOnlineMode()) {
      postAddressToMainWindow(address, source, accountName);
    }
  };

  /// Update address in store.
  const updateAddressInStore = async (
    source: AccountSource,
    address: string,
    accountName: string
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:add',
      data: { source, address, name: accountName },
    };

    await window.myAPI.rawAccountTask(ipcTask);
  };

  /// Send address data to main renderer to process.
  const postAddressToMainWindow = (
    address: string,
    source: AccountSource,
    accountName: string
  ) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        address,
        chainId: getAddressChainId(address),
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
