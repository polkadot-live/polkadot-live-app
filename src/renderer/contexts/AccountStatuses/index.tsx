// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useState } from 'react';
import { Config as ConfigImport } from '@/config/processes/import';
import * as defaults from './defaults';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { AccountStatusesContextInterface } from './types';

export const AccountStatusesContext =
  createContext<AccountStatusesContextInterface>(
    defaults.defaultAccountStatusesContext
  );

export const useAccountStatuses = () => useContext(AccountStatusesContext);

export const AccountStatusesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Utility to fetch account statuses based on account data in local storage.
  const fetchAccountStatuses = (
    source: AccountSource
  ): Map<string, boolean> => {
    const map = new Map<string, boolean>();
    const key: string = ConfigImport.getStorageKey(source);
    const fetched: string | null = localStorage.getItem(key);

    switch (source) {
      case 'read-only':
      case 'vault': {
        const parsed: LocalAddress[] = fetched ? JSON.parse(fetched) : [];
        for (const { address } of parsed) {
          map.set(address, false);
        }
        return map;
      }
      case 'ledger': {
        const parsed: LedgerLocalAddress[] =
          fetched !== null ? JSON.parse(fetched) : [];
        for (const { address } of parsed) {
          map.set(address, false);
        }
        return map;
      }
      default: {
        return map;
      }
    }
  };

  /// Status of vault accounts.
  const [vaultAccountStatuses, setVaultAccountStatuses] = useState<
    Map<string, boolean>
  >(() => fetchAccountStatuses('vault'));

  /// Status of ledger accounts.
  const [ledgerAccountStatuses, setLedgerAccountStatuses] = useState<
    Map<string, boolean>
  >(() => fetchAccountStatuses('ledger'));

  /// Status of read-only accounts.
  const [readOnlyAccountStatuses, setReadOnlyAccountStatuses] = useState<
    Map<string, boolean>
  >(() => fetchAccountStatuses('read-only'));

  /// Set processing status of an account.
  const setStatusForAccount = (
    address: string,
    source: AccountSource,
    status: boolean
  ) => {
    switch (source) {
      case 'ledger': {
        setLedgerAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(address, status);
          return cloned;
        });
        break;
      }
      case 'read-only': {
        setReadOnlyAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(address, status);
          return cloned;
        });
        break;
      }
      case 'vault': {
        setVaultAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(address, status);
          return cloned;
        });
        break;
      }
      default: {
        break;
      }
    }
  };

  /// Get the processing status of an account.
  const getStatusForAccount = (address: string, source: AccountSource) => {
    switch (source) {
      case 'ledger': {
        return ledgerAccountStatuses.get(address) || null;
      }
      case 'read-only': {
        return readOnlyAccountStatuses.get(address) || null;
      }
      case 'vault': {
        return vaultAccountStatuses.get(address) || null;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <AccountStatusesContext.Provider
      value={{
        ledgerAccountStatuses,
        readOnlyAccountStatuses,
        vaultAccountStatuses,
        setLedgerAccountStatuses,
        setReadOnlyAccountStatuses,
        setVaultAccountStatuses,
        setStatusForAccount,
        getStatusForAccount,
      }}
    >
      {children}
    </AccountStatusesContext.Provider>
  );
};
