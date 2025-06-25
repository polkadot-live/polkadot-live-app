// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { ConfigImport } from '@polkadot-live/core';
import { getSupportedChains } from '@polkadot-live/consts/chains';
import { createContext, useContext } from 'react';
import { decodeAddress, encodeAddress, u8aToHex } from 'dedot/utils';
import { renderToast } from '@polkadot-live/ui/utils';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ImportHandlerContextInterface } from './types';
import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import { ellipsisFn } from '@w3ux/utils';

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
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressImport } = useAddresses();

  /// Exposed function to import an address.
  const handleImportAddress = async (
    enAddress: string,
    source: AccountSource,
    accountName: string,
    mainImport = true, // Whether to send the address to main window.
    device?: AnyData
  ) => {
    // Construct generic account and set import status.
    const genericAccount = construct(enAddress, source, accountName, device);
    const { encodedAccounts } = genericAccount;

    for (const enAccount of Object.values(encodedAccounts)) {
      const { address, chainId, isImported } = enAccount;
      const status = isImported && getOnlineMode();
      setStatusForAccount(`${chainId}:${address}`, source, status);

      // Send data to main renderer for processing.
      if ((isImported && !getOnlineMode()) || !mainImport) {
        enAccount.isImported = false;
      } else if (isImported) {
        postToMain(genericAccount, enAccount);
      }

      // Render success message if not importing to main window.
      if (!enAccount.isImported) {
        renderToast('Account added successfully', 'import-success', 'success');
      }
    }

    // Update state and store.
    handleAddressImport(genericAccount);
    await persist(genericAccount);
  };

  /// Import an "imported" account from a data file.
  const handleImportAddressFromBackup = async (
    genericAccount: ImportedGenericAccount
  ) => {
    const { encodedAccounts, source } = genericAccount;

    // Set processing flag for account if it needs importing.
    for (const { address, chainId, isImported } of Object.values(
      encodedAccounts
    )) {
      setStatusForAccount(`${chainId}:${address}`, source, isImported);
    }

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
  ): ImportedGenericAccount => {
    const publicKeyHex = u8aToHex(decodeAddress(address));
    const encodedAccounts = {} as Record<ChainID, EncodedAccount>;

    for (const [cid, { prefix }] of Object.entries(getSupportedChains())) {
      const chainId = cid as ChainID;
      const encoded = encodeAddress(publicKeyHex, prefix);
      encodedAccounts[chainId] = {
        isImported: false,
        chainId,
        address: encoded,
        alias: ellipsisFn(encoded, 5),
      };
    }

    return {
      accountName,
      encodedAccounts,
      publicKeyHex,
      source,
      ledger: source === 'ledger' ? { ...device } : undefined,
    };
  };

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
    encodedAccount: EncodedAccount
  ) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        serEncodedAccount: JSON.stringify(genericAccount),
        serGenericAccount: JSON.stringify(encodedAccount),
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
