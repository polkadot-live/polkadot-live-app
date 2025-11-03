// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { SummaryContextInterface } from '@polkadot-live/contexts/types/main';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';

export const SummaryContext = createContext<
  SummaryContextInterface | undefined
>(undefined);

export const useSummary = createSafeContextHook(
  SummaryContext,
  'SummaryContext'
);

export const SummaryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * Addresses fetched from main process.
   */
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, ImportedGenericAccount[]>()
  );
  const addressMapRef = useRef<typeof addressMap>(addressMap);

  /**
   * Extrinsic counts.
   */
  const [extrinsicCounts, setExtrinsicCounts] = useState(
    new Map<TxStatus, number>()
  );
  const extrinsicCountsRef = useRef(extrinsicCounts);

  /**
   * Fetch stored addresss from main when component loads.
   */
  useEffect(() => {
    const fetch = async () => {
      const [r1, r2] = await Promise.all([
        chrome.runtime.sendMessage({
          type: 'rawAccount',
          task: 'getAll',
        }),
        chrome.runtime.sendMessage({
          type: 'extrinsics',
          task: 'getAll',
        }),
      ]);

      type T = [AccountSource, ImportedGenericAccount[]][];
      const arr: T = JSON.parse(r1 as string);
      const map = new Map<AccountSource, ImportedGenericAccount[]>(arr);
      addressMapRef.current = map;

      // Extrinsics.
      const getTxCount = (extrinsics: ExtrinsicInfo[], status?: TxStatus) =>
        status
          ? extrinsics.filter((info) => info.txStatus === status).length
          : extrinsics.length;
      extrinsicCountsRef.current.set('pending', getTxCount(r2, 'pending'));
      extrinsicCountsRef.current.set('finalized', getTxCount(r2, 'finalized'));

      // state update.
      setAddressMap(addressMapRef.current);
      setExtrinsicCounts(extrinsicCountsRef.current);
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
