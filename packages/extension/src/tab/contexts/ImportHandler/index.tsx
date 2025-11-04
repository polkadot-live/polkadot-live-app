// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getSupportedChains,
  getSupportedLedgerChains,
} from '@polkadot-live/consts/chains';
import { createContext } from 'react';
import { createSafeContextHook, useConnections } from '@polkadot-live/contexts';
import { renderToast } from '@polkadot-live/ui/utils';
import { decodeAddress, encodeAddress, u8aToHex } from 'dedot/utils';
import { useAccountStatuses } from '../AccountStatuses';
import { useAddresses } from '../Addresses';
import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
  LedgerMetadata,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ImportHandlerContextInterface } from '@polkadot-live/contexts/types/import';

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
    const payload = { account: genericAccount };
    const msg = { type: 'rawAccount', task: 'persist', payload };
    const res = await chrome.runtime.sendMessage(msg);
    console.log(`Persist ${genericAccount.accountName}:${res}`);
  };

  /**
   * Add address to main renderer.
   */
  const postToMain = (
    genericAccount: ImportedGenericAccount,
    encodedAccount: EncodedAccount
  ) => {
    console.log(`Import ${genericAccount.accountName}:${encodedAccount.alias}`);
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'importAddress',
      payload: { encodedAccount, genericAccount },
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
