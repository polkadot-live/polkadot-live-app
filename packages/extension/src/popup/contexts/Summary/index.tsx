// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { SummaryContextInterface } from '@polkadot-live/contexts/types/main';
import type { TxStatus } from '@polkadot-live/types/tx';

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
   * TODO: Remove
   */
  const [trigger, setTrigger] = useState<boolean>(false);

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
      const result = (await chrome.runtime.sendMessage({
        type: 'rawAccount',
        task: 'getAll',
      })) as string;

      type T = [AccountSource, ImportedGenericAccount[]][];
      const arr: T = JSON.parse(result);
      const map = new Map<AccountSource, ImportedGenericAccount[]>(arr);
      addressMapRef.current = map;

      // TODO: Extrinsics.
      extrinsicCountsRef.current.set('pending', 0);
      extrinsicCountsRef.current.set('finalized', 0);

      // Trigger state update.
      setTrigger(true);
    };

    fetch();
  }, []);

  /**
   * Trigger to update state.
   */
  useEffect(() => {
    if (trigger) {
      setAddressMap(addressMapRef.current);
      setExtrinsicCounts(extrinsicCountsRef.current);
      setTrigger(false);
    }
  }, [trigger]);

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
