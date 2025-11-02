// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getFromBackupFile } from '@polkadot-live/core';
import { getAllAccounts, persistAccount, updateAccount } from '../accounts';
import { isAlreadyPersisted } from '../accounts/utils';
import { sendChromeMessage } from '../utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export const importAddressData = async (
  contents: string,
  isOnline: boolean,
  handleImportAddress: (
    generic: ImportedGenericAccount,
    encoded: EncodedAccount,
    onlineMode: boolean,
    fromBackup: boolean
  ) => Promise<void>,
  handleRemoveAddress: (address: string, chainId: ChainID) => Promise<void>
) => {
  const serAddresses = getFromBackupFile('addresses', contents);
  if (!serAddresses) {
    return;
  }
  type A = [AccountSource, ImportedGenericAccount[]][];
  const arr: A = JSON.parse(serAddresses);
  const map = new Map<AccountSource, ImportedGenericAccount[]>(arr);

  for (const genericAccounts of map.values()) {
    // Process parsed generic accounts.
    for (const generic of genericAccounts) {
      const { encodedAccounts, publicKeyHex } = generic;

      // Set correct `isImported` flag.
      for (const encoded of Object.values(encodedAccounts)) {
        if (encoded.isImported && !isOnline) {
          const chainId = encoded.chainId;
          generic.encodedAccounts[chainId].isImported = false;
        }
      }
      // Persist or update generic account in database.
      const alreadyExists = await isAlreadyPersisted(publicKeyHex);
      alreadyExists
        ? await updateAccount(generic)
        : await persistAccount(generic);

      // Import or remove encoded accounts from main window.
      for (const encoded of Object.values(encodedAccounts)) {
        const { address, chainId, isImported } = encoded;
        isImported
          ? await handleImportAddress(generic, encoded, isOnline, true)
          : await handleRemoveAddress(address, chainId);

        // TODO Update managed account names if needed.
      }
    }
  }
  // Update accounts tab state if needed.
  sendChromeMessage('rawAccount', 'import:setAccounts', {
    ser: await getAllAccounts(),
  });
  // TODO: Update main window state if needed.
};
