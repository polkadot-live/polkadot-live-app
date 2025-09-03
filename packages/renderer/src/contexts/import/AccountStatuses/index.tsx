// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { getSupportedSources } from '@polkadot-live/consts/chains';
import { setStateWithRef } from '@w3ux/utils';
import { useAddresses } from '../Addresses';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { AccountStatusesContextInterface } from './types';

export const AccountStatusesContext = createContext<
  AccountStatusesContextInterface | undefined
>(undefined);

/**
 * @name useAccountStatuses
 * @summary An account status of `true` means it is processing, while `false` means
 * it's not processing.
 *
 * When an account is being imported, it may take several seconds to initialize
 * and sync its data with the state on its blockchain network. During this processing
 * time, its status is set to `true`.
 */
export const useAccountStatuses = createSafeContextHook(
  AccountStatusesContext,
  'AccountStatusesContext'
);

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
  const statusMapRef = useRef(statusMap);

  /**
   * Initialize status map on mount.
   */
  useEffect(() => {
    const outer: typeof statusMap = new Map();

    for (const source of getSupportedSources()) {
      const map = new Map<string, boolean>();
      for (const { encodedAccounts } of getAccounts(source)) {
        for (const { address } of Object.values(encodedAccounts)) {
          map.set(address, false);
        }
      }
      outer.set(source, map);
    }

    setStateWithRef(outer, setStatusMap, statusMapRef);
  }, []);

  /**
   * Set processing status of an account.
   */
  const setStatusForAccount = (
    key: string,
    source: AccountSource,
    status: boolean
  ) => {
    const sourceMap = statusMap.get(source) || new Map<string, boolean>();
    const updated = new Map(sourceMap).set(key, status);
    const map = new Map(statusMap).set(source, updated);
    setStateWithRef(map, setStatusMap, statusMapRef);
  };

  /**
   * Get the processing status of an account.
   */
  const getStatusForAccount = (key: string, source: AccountSource) =>
    statusMapRef.current.get(source)?.get(key) || null;

  /**
   * Delete an account status entry.
   */
  const deleteAccountStatus = (key: string, source: AccountSource) => {
    const sourceMap = statusMapRef.current.get(source);
    if (!sourceMap) {
      return;
    }

    sourceMap.delete(key);
    const map = new Map(statusMap).set(source, sourceMap);
    setStateWithRef(map, setStatusMap, statusMapRef);
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
    <AccountStatusesContext
      value={{
        anyProcessing,
        setStatusForAccount,
        getStatusForAccount,
        deleteAccountStatus,
      }}
    >
      {children}
    </AccountStatusesContext>
  );
};
