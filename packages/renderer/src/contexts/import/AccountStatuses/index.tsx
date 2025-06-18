// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import { getSupportedSources } from '@polkadot-live/consts/chains';
import { useAddresses } from '../Addresses';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
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
  const { getAccounts } = useAddresses();

  /**
   * Processing status map.
   */
  const [statusMap, setStatusMap] = useState(
    new Map<AccountSource, Map<string, boolean>>()
  );

  /**
   * Initialize status map on mount.
   */
  useEffect(() => {
    for (const source of getSupportedSources()) {
      const map = new Map<string, boolean>();
      for (const { encodedAccounts } of getAccounts(source)) {
        for (const { address } of Object.values(encodedAccounts)) {
          map.set(address, false);
        }
      }

      const updated = new Map(statusMap).set(source, map);
      setStatusMap(updated);
    }
  }, []);

  /**
   * Set processing status of an account.
   */
  const setStatusForAccount = (
    enAddress: string,
    source: AccountSource,
    status: boolean
  ) => {
    const sourceMap = statusMap.get(source)!;
    const updated = new Map(sourceMap).set(enAddress, status);
    setStatusMap((prev) => prev.set(source, updated));
  };

  /**
   * Get the processing status of an account.
   */
  const getStatusForAccount = (enAddress: string, source: AccountSource) =>
    statusMap.get(source)?.get(enAddress) || null;

  /**
   * Insert an account status entry.
   */
  const insertAccountStatus = (enAddress: string, source: AccountSource) => {
    const sourceMap = statusMap.get(source)!;
    setStatusMap((prev) => prev.set(source, sourceMap.set(enAddress, false)));
  };

  /**
   * Delete an account status entry.
   */
  const deleteAccountStatus = (enAddress: string, source: AccountSource) => {
    const sourceMap = statusMap.get(source)!;
    if (sourceMap.has(enAddress)) {
      sourceMap.delete(enAddress);
    }

    setStatusMap((prev) => prev.set(source, sourceMap));
  };

  /**
   * Utility to determine if any encoded accounts are processing.
   */
  const anyProcessing = (genericAccount: ImportedGenericAccount): boolean => {
    const { encodedAccounts, source } = genericAccount;
    return Object.values(encodedAccounts)
      .map(({ address }) => Boolean(getStatusForAccount(address, source)))
      .some(Boolean);
  };

  return (
    <AccountStatusesContext.Provider
      value={{
        anyProcessing,
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
