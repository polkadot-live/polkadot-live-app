// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
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
        for (const { publicKeyHex } of ledgerAddresses) {
          map.set(publicKeyHex, false);
        }
        return map;
      }
      case 'read-only': {
        for (const { publicKeyHex } of readOnlyAddresses) {
          map.set(publicKeyHex, false);
        }
        return map;
      }
      case 'vault': {
        for (const { publicKeyHex } of vaultAddresses) {
          map.set(publicKeyHex, false);
        }
        return map;
      }
      case 'wallet-connect': {
        for (const { publicKeyHex } of wcAddresses) {
          map.set(publicKeyHex, false);
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
    publicKeyHex: string,
    source: AccountSource,
    status: boolean
  ) => {
    switch (source) {
      case 'ledger': {
        setLedgerAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(publicKeyHex, status);
          return cloned;
        });
        break;
      }
      case 'read-only': {
        setReadOnlyAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(publicKeyHex, status);
          return cloned;
        });
        break;
      }
      case 'vault': {
        setVaultAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(publicKeyHex, status);
          return cloned;
        });
        break;
      }
      case 'wallet-connect': {
        setWcAccountStatuses((prev) => {
          const cloned = new Map(prev);
          cloned.set(publicKeyHex, status);
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
  const getStatusForAccount = (publicKeyHex: string, source: AccountSource) => {
    switch (source) {
      case 'ledger': {
        return ledgerAccountStatuses.get(publicKeyHex) || null;
      }
      case 'read-only': {
        return readOnlyAccountStatuses.get(publicKeyHex) || null;
      }
      case 'vault': {
        return vaultAccountStatuses.get(publicKeyHex) || null;
      }
      case 'wallet-connect': {
        return wcAccountStatuses.get(publicKeyHex) || null;
      }
      default: {
        return null;
      }
    }
  };

  /// Insert an account status entry.
  const insertAccountStatus = (publicKeyHex: string, source: AccountSource) => {
    switch (source) {
      case 'ledger': {
        ledgerAccountStatuses.set(publicKeyHex, false);
        break;
      }
      case 'read-only': {
        readOnlyAccountStatuses.set(publicKeyHex, false);
        break;
      }
      case 'vault': {
        vaultAccountStatuses.set(publicKeyHex, false);
        break;
      }
      case 'wallet-connect': {
        wcAccountStatuses.set(publicKeyHex, false);
        break;
      }
      default: {
        break;
      }
    }
  };

  /// Delete an account status entry.
  const deleteAccountStatus = (publicKeyHex: string, source: AccountSource) => {
    switch (source) {
      case 'ledger': {
        if (ledgerAccountStatuses.has(publicKeyHex)) {
          ledgerAccountStatuses.delete(publicKeyHex);
        }
        break;
      }
      case 'read-only': {
        if (readOnlyAccountStatuses.has(publicKeyHex)) {
          readOnlyAccountStatuses.delete(publicKeyHex);
        }
        break;
      }
      case 'vault': {
        if (vaultAccountStatuses.has(publicKeyHex)) {
          vaultAccountStatuses.delete(publicKeyHex);
        }
        break;
      }
      case 'wallet-connect': {
        if (wcAccountStatuses.has(publicKeyHex)) {
          wcAccountStatuses.delete(publicKeyHex);
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
