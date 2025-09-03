// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import {
  getSupportedChains,
  getSupportedLedgerChains,
} from '@polkadot-live/consts/chains';
import { createContext } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { decodeAddress, encodeAddress, u8aToHex } from 'dedot/utils';
import { renderToast } from '@polkadot-live/ui/utils';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ImportHandlerContextInterface } from './types';
import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
  LedgerMetadata,
} from '@polkadot-live/types/accounts';

export const ImportHandlerContext = createContext<
  ImportHandlerContextInterface | undefined
>(undefined);

export const useImportHandler = createSafeContextHook(
  ImportHandlerContext,
  'ImportHandlerContext'
);

export const ImportHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressImport, getDefaultName } = useAddresses();

  /**
   * Exposed function to import an address.
   */
  const handleImportAddress = async (
    enAddress: string,
    source: AccountSource,
    accountName?: string,
    ledgerMeta?: LedgerMetadata,
    showToast = true
  ) => {
    // Construct generic account and set import status.
    const genericAccount = construct(
      enAddress,
      source,
      accountName,
      ledgerMeta
    );

    const { encodedAccounts } = genericAccount;

    for (const enAccount of Object.values(encodedAccounts)) {
      const { address, chainId, isImported } = enAccount;
      const status = isImported && getOnlineMode();
      setStatusForAccount(`${chainId}:${address}`, source, status);

      // Send data to main renderer for processing.
      if (isImported && !getOnlineMode()) {
        enAccount.isImported = false;
      } else if (isImported) {
        postToMain(genericAccount, enAccount);
      }
    }

    // Update state and store.
    handleAddressImport(genericAccount);
    await persist(genericAccount);

    // Render success message if not importing to main window.
    showToast &&
      renderToast(
        `Account added successfully as ${genericAccount.accountName}`,
        'import-success',
        'success'
      );
  };

  /**
   * Import an account from a data file.
   */
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
    accountName?: string,
    ledgerMeta?: LedgerMetadata
  ): ImportedGenericAccount => {
    const _accountName = accountName || getDefaultName();
    const encodedAccounts = {} as Record<ChainID, EncodedAccount>;
    const publicKeyHex = u8aToHex(decodeAddress(address));

    for (const [cid, { prefix }] of Object.entries(getSupportedChains())) {
      const chainId = cid as ChainID;
      const encoded = encodeAddress(publicKeyHex, prefix);

      const _ledgerMeta: LedgerMetadata | undefined =
        ledgerMeta && getSupportedLedgerChains().includes(chainId)
          ? { ...ledgerMeta }
          : undefined;

      encodedAccounts[chainId] = {
        address: encoded,
        alias: `${_accountName}-${cid}`,
        chainId,
        isBookmarked: false,
        isImported: false,
        ledgerMeta: _ledgerMeta,
      };
    }

    return {
      accountName: _accountName,
      encodedAccounts,
      publicKeyHex,
      source,
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
    <ImportHandlerContext
      value={{
        handleImportAddress,
        handleImportAddressFromBackup,
      }}
    >
      {children}
    </ImportHandlerContext>
  );
};
