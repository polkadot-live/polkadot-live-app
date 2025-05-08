// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import { useAddresses } from '../Addresses';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { AccountStatusesContextInterface } from './types';

export const AccountStatusesContext =
  createContext<AccountStatusesContextInterface>(
    defaults.defaultAccountStatusesContext
  );

/**
 * @name useAccountStatuses
 * @summary An account status of `true` means it is processing, while `false` means
 * it's not processing.
 *
 * When an account is being imported, it may take several seconds to initialize
 * and sync its data with the state on its blockchain network. During this processing
 * time, its status is set to `true`.
 */
export const useAccountStatuses = () => useContext(AccountStatusesContext);

export const AccountStatusesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { ledgerAddresses, readOnlyAddresses, vaultAddresses, wcAddresses } =
    useAddresses();

  /// Utility to initialize account statuses to false.
  const fetchAccountStatuses = (
    source: AccountSource
  ): Map<string, boolean> => {
    const map = new Map<string, boolean>();
    switch (source) {
      case 'ledger': {
        for (const { address } of ledgerAddresses) {
          map.set(address, false);
        }
        return map;
      }
      case 'read-only': {
        for (const { address } of readOnlyAddresses) {
          map.set(address, false);
        }
        return map;
      }
      case 'vault': {
        for (const { address } of vaultAddresses) {
          map.set(address, false);
        }
        return map;
      }
      case 'wallet-connect': {
        for (const { address } of wcAddresses) {
          map.set(address, false);
        }
        return map;
      }
      default: {
        throw new Error('unreachable');
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

  /// Status of wallet-connect accounts.
  const [wcAccountStatuses, setWcAccountStatuses] = useState<
    Map<string, boolean>
  >(() => fetchAccountStatuses('wallet-connect'));

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
      case 'wallet-connect': {
        setWcAccountStatuses((prev) => {
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
      case 'wallet-connect': {
        return wcAccountStatuses.get(address) || null;
      }
      default: {
        return null;
      }
    }
  };

  /// Insert an account status entry.
  const insertAccountStatus = (address: string, source: AccountSource) => {
    switch (source) {
      case 'ledger': {
        ledgerAccountStatuses.set(address, false);
        break;
      }
      case 'read-only': {
        readOnlyAccountStatuses.set(address, false);
        break;
      }
      case 'vault': {
        vaultAccountStatuses.set(address, false);
        break;
      }
      case 'wallet-connect': {
        wcAccountStatuses.set(address, false);
        break;
      }
      default: {
        break;
      }
    }
  };

  /// Delete an account status entry.
  const deleteAccountStatus = (address: string, source: AccountSource) => {
    switch (source) {
      case 'ledger': {
        if (ledgerAccountStatuses.has(address)) {
          ledgerAccountStatuses.delete(address);
        }
        break;
      }
      case 'read-only': {
        if (readOnlyAccountStatuses.has(address)) {
          readOnlyAccountStatuses.delete(address);
        }
        break;
      }
      case 'vault': {
        if (vaultAccountStatuses.has(address)) {
          vaultAccountStatuses.delete(address);
        }
        break;
      }
      case 'wallet-connect': {
        if (wcAccountStatuses.has(address)) {
          wcAccountStatuses.delete(address);
        }
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <AccountStatusesContext.Provider
      value={{
        ledgerAccountStatuses,
        readOnlyAccountStatuses,
        vaultAccountStatuses,
        wcAccountStatuses,
        setLedgerAccountStatuses,
        setReadOnlyAccountStatuses,
        setVaultAccountStatuses,
        setWcAccountStatuses,
        setStatusForAccount,
        getStatusForAccount,
        insertAccountStatus,
        deleteAccountStatus,
      }}
    >
      {children}
    </AccountStatusesContext.Provider>
  );
};
