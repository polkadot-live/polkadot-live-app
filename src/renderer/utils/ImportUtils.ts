// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';
import { ellipsisFn, unescape } from '@w3ux/utils';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

/**
 * @name getLocalAccountName
 * @summary Returns an account's name by fetching it from local storage or returning the truncated address.
 */
export const getLocalAccountName = (
  address: string,
  source: AccountSource
): string => {
  const defaultName = ellipsisFn(address);
  const stored = localStorage.getItem(ConfigImport.getStorageKey(source));

  // Return truncated address if no storage found.
  if (!stored) {
    return defaultName;
  }

  // Parse fetched addresses and see if this address has a custom name.
  if (source === 'ledger') {
    const parsed: LedgerLocalAddress[] = JSON.parse(stored);
    const fetched = parsed.find(
      (a: LedgerLocalAddress) => a.address === address
    );
    return fetched ? unescape(fetched.name) : defaultName;
  } else {
    const parsed: LocalAddress[] = JSON.parse(stored);
    const fetched = parsed.find((a: LocalAddress) => a.address === address);
    return fetched ? unescape(fetched.name) : defaultName;
  }
};

/**
 * @name renameLocalAccount
 * @summary Sets an account's name in local storage.
 */
export const renameLocalAccount = (
  address: string,
  newName: string,
  source: AccountSource
) => {
  // Get serialized addresses from local storage.
  const storageKey = ConfigImport.getStorageKey(source);
  const stored = localStorage.getItem(storageKey);

  if (!stored) {
    return;
  }

  // Update local storage account data.
  if (source === 'ledger') {
    const parsed: LedgerLocalAddress[] = JSON.parse(stored);
    const updated = parsed.map((a: LedgerLocalAddress) =>
      a.address !== address ? a : { ...a, name: newName }
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } else {
    const parsed: LocalAddress[] = JSON.parse(stored);
    const updated = parsed.map((a: LocalAddress) =>
      a.address !== address ? a : { ...a, name: newName }
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }
};
