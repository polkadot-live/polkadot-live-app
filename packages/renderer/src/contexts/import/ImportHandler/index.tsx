// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport, getAddressChainId } from '@polkadot-live/core';
import { createContext, useContext } from 'react';
import { decodeAddress, u8aToHex } from 'dedot/utils';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ImportHandlerContextInterface } from './types';
import type {
  AccountSource,
  ImportedGenericAccount,
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
  const { getOnlineMode } = useConnections();
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
    // Construct generic account and set import status.
    const genericAccount = construct(address, source, accountName, device);
    const isImported = getOnlineMode() && mainImport;
    genericAccount.isImported = isImported;
    setStatusForAccount(genericAccount.publicKeyHex, source, isImported);

    // Update addresses state and references.
    handleAddressImport(genericAccount);

    // Persist account to store in main process.
    await persist(genericAccount);

    // Send data to main renderer for processing.
    if (isImported) {
      postToMain(genericAccount, genericAccount.publicKeyHex, address);
    }
  };

  /// Import an "imported" account from a data file.
  const handleImportAddressFromBackup = async (
    genericAccount: ImportedGenericAccount
  ) => {
    const { publicKeyHex, isImported, source } = genericAccount;

    // Set processing flag for account if it needs importing.
    isImported
      ? setStatusForAccount(publicKeyHex, source, true)
      : insertAccountStatus(publicKeyHex, source);

    // Update addresses state and references.
    handleAddressImport(genericAccount);
  };

  /**
   * Construct a generic account.
   */
  const construct = (
    address: string,
    source: AccountSource,
    accountName: string,
    device?: AnyData
  ): ImportedGenericAccount => ({
    accountName,
    isImported: false,
    publicKeyHex: u8aToHex(decodeAddress(address)),
    source,
    ledger: source === 'ledger' ? { ...device } : undefined,
  });

  /**
   * Persist generic account to store.
   */
  const persist = async (genericAccount: ImportedGenericAccount) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:persist',
      data: { serialized: JSON.stringify(genericAccount) },
    });
  };

  /**
   * Add address to main renderer.
   */
  const postToMain = (
    genericAccount: ImportedGenericAccount,
    publicKeyHex: string,
    address: string // TODO: Remove
  ) => {
    const { accountName, source } = genericAccount;
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
