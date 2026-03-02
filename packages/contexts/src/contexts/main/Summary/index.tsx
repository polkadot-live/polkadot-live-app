// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getSummaryAdapter } from './adapters';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { TxStatus } from '@polkadot-live/types/tx';
import type { SummaryContextInterface } from '../../../types/main';

export const SummaryContext = createContext<
  SummaryContextInterface | undefined
>(undefined);

export const useSummary = createSafeContextHook(
  SummaryContext,
  'SummaryContext',
);

export const SummaryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getSummaryAdapter();

  // Addresses fetched from main process.
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, ImportedGenericAccount[]>(),
  );
  const addressMapRef = useRef<typeof addressMap>(addressMap);

  // Extrinsic counts.
  const [extrinsicCounts, setExtrinsicCounts] = useState(
    new Map<TxStatus, number>(),
  );
  const extrinsicCountsRef = useRef(extrinsicCounts);

  // Adjust a specific extrinsic count by a delta value.
  const adjustExtrinsicCount = useCallback(
    (status: TxStatus, delta: number) => {
      setExtrinsicCounts((prev) => {
        const updated = new Map(prev);
        const current = updated.get(status) ?? 0;
        updated.set(status, Math.max(0, current + delta));
        extrinsicCountsRef.current = updated;
        return updated;
      });
    },
    [],
  );

  // Handle extrinsic status changes for summary counts.
  const handleTxStatusChange = useCallback(
    (status: TxStatus) => {
      if (status === 'submitted') {
        adjustExtrinsicCount('pending', -1);
      } else if (status === 'finalized') {
        adjustExtrinsicCount('finalized', 1);
      }
    },
    [adjustExtrinsicCount],
  );

  // Handle an account change (import or removal) in the address map.
  const handleAccountChange = useCallback(
    (account: ImportedGenericAccount, action: 'add' | 'remove') => {
      const { source, publicKeyHex } = account;

      setAddressMap((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(source) ?? [];

        if (action === 'add') {
          if (existing.some((a) => a.publicKeyHex === publicKeyHex)) {
            return prev;
          }
          updated.set(source, [...existing, account]);
        } else {
          updated.set(
            source,
            existing.filter((a) => a.publicKeyHex !== publicKeyHex),
          );
        }

        addressMapRef.current = updated;
        return updated;
      });
    },
    [],
  );

  // Fetch stored addresss from main when component loads.
  useEffect(() => {
    const fetch = async () => {
      await adapter.onMount(
        addressMapRef,
        extrinsicCountsRef,
        setAddressMap,
        setExtrinsicCounts,
      );
    };
    fetch();
  }, []);

  // Listen for account imports and removals from the main process.
  useEffect(() => {
    const removeListener = adapter.listenForAccountChanges(handleAccountChange);
    return () => {
      removeListener?.();
    };
  }, []);

  return (
    <SummaryContext
      value={{
        addressMap,
        extrinsicCounts,
        adjustExtrinsicCount,
        handleTxStatusChange,
      }}
    >
      {children}
    </SummaryContext>
  );
};
