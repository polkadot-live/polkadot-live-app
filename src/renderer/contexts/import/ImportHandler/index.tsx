// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigImport } from '@/config/processes/import';
import { getAddressChainId } from '@/renderer/Utils';
import { createContext, useContext } from 'react';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import type { AnyData } from '@/types/misc';
import type { ImportHandlerContextInterface } from './types';
import type { IpcTask } from '@/types/communication';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

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
  const { setStatusForAccount } = useAccountStatuses();
  const { setReadOnlyAddresses, setVaultAddresses, setLedgerAddresses } =
    useAddresses();

  /// Exposed function to import an address.
  const handleImportAddress = async (
    address: string,
    source: AccountSource,
    accountName: string,
    pubKey?: string,
    device?: AnyData
  ) => {
    // Set processing flag for account.
    setStatusForAccount(address, source, isConnected ? true : false);

    const local = constructRawAddress(
      address,
      source,
      accountName,
      device,
      pubKey
    );

    // Process account import in main renderer.
    if (source === 'vault') {
      handleVaultImport(local as LocalAddress);
    } else if (source === 'ledger') {
      handleLedgerImport(local as LedgerLocalAddress);
    } else if (source === 'read-only') {
      handleReadOnlyImport(local as LocalAddress);
    }

    // Persist account to store in main process.
    await persistAddressToStore(source, local);

    // Send data to main renderer for processing.
    if (isConnected) {
      postAddressToMainWindow(address, source, accountName);
    }
  };

  /// Update import window read-only addresses state.
  const handleReadOnlyImport = (local: LocalAddress) => {
    setReadOnlyAddresses((prev: LocalAddress[]) =>
      prev.filter((a) => a.address !== local.address).concat([{ ...local }])
    );
  };

  /// Update import window vault addresses state.
  const handleVaultImport = (local: LocalAddress) => {
    setVaultAddresses((prev: LocalAddress[]) =>
      prev.filter((a) => a.address !== local.address).concat([{ ...local }])
    );
  };

  /// Update import window ledger addresses state.
  const handleLedgerImport = (local: LedgerLocalAddress) => {
    setLedgerAddresses((prev: LedgerLocalAddress[]) =>
      prev.filter((a) => a.address !== local.address).concat([{ ...local }])
    );
  };

  /// Construct raw address data structure.
  const constructRawAddress = (
    address: string,
    source: AccountSource,
    accountName: string,
    device?: AnyData,
    pubKey?: string
  ) =>
    source === 'ledger'
      ? ({
          address,
          device: { ...device },
          isImported: isConnected ? true : false,
          name: accountName,
          pubKey: pubKey || '',
          source,
        } as LedgerLocalAddress)
      : ({
          address,
          isImported: isConnected ? true : false,
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
      }}
    >
      {children}
    </ImportHandlerContext.Provider>
  );
};
