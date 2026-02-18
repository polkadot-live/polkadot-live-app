// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
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

  return (
    <SummaryContext
      value={{
        addressMap,
        extrinsicCounts,
      }}
    >
      {children}
    </SummaryContext>
  );
};
