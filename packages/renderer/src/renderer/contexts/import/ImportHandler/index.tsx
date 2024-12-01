// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@ren/config/processes/import';
import { getAddressChainId } from '@app/Utils';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ImportHandlerContextInterface } from './types';
import type { IpcTask } from '@polkadot-live/types/communication';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';

export const ImportHandlerContext =
  createContext<ImportHandlerContextInterface>(
    defaults.defaultImportHandlerContext
  );

export const useImportHandler = () => useContext(ImportHandlerContext);

export const ImportHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isConnected } = useConnections();
  const { setStatusForAccount, insertAccountStatus } = useAccountStatuses();
  const { handleAddressImport } = useAddresses();

  /// Exposed function to import an address.
  const handleImportAddress = async (
    address: string,
    source: AccountSource,
    accountName: string,
    mainImport = true, // Whether to send the address to main window.
    pubKey?: string,
    device?: AnyData
  ) => {
    // Set processing flag for account.
    const doMainImport = isConnected && mainImport;
    setStatusForAccount(address, source, doMainImport);

    const local = constructRawAddress(
      address,
      source,
      accountName,
      doMainImport,
      device,
      pubKey
    );

    // Update addresses state and references.
    handleAddressImport(source, local);

    // Persist account to store in main process.
    await persistAddressToStore(source, local);

    // Send data to main renderer for processing.
    if (isConnected && mainImport) {
      postAddressToMainWindow(address, source, accountName);
    }
  };

  /// Import an "imported" account from a data file.
  const handleImportAddressFromBackup = async (
    imported: LocalAddress | LedgerLocalAddress,
    source: AccountSource
  ) => {
    const { address, isImported } = imported;

    // Set processing flag for account if it needs importing.
    isImported
      ? setStatusForAccount(address, source, true)
      : insertAccountStatus(address, source);

    // Update addresses state and references.
    handleAddressImport(source, imported);
  };

  /// Construct raw address data structure.
  const constructRawAddress = (
    address: string,
    source: AccountSource,
    accountName: string,
    isImported: boolean,
    device?: AnyData,
    pubKey?: string
  ) =>
    source === 'ledger'
      ? ({
          address,
          device: { ...device },
          isImported,
          name: accountName,
          pubKey: pubKey || '',
          source,
        } as LedgerLocalAddress)
      : ({
          address,
          isImported,
          name: accountName,
          source,
        } as LocalAddress);

  /// Send local address to main process for persisting to store.
  const persistAddressToStore = async (
    source: AccountSource,
    local: LocalAddress | LedgerLocalAddress
  ) => {
    const ipcTask: IpcTask = {
      action: 'raw-account:persist',
      data: {
        source,
        serialized: JSON.stringify(local),
      },
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
    <ImportHandlerContext.Provider
      value={{
        handleImportAddress,
        handleImportAddressFromBackup,
      }}
    >
      {children}
    </ImportHandlerContext.Provider>
  );
};
