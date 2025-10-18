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
      // Accounts.
      const serialized = (await window.myAPI.rawAccountTask({
        action: 'raw-account:getAll',
        data: null,
      })) as string;

      const parsedMap = new Map<AccountSource, string>(JSON.parse(serialized));
      for (const [source, ser] of parsedMap.entries()) {
        const parsed: ImportedGenericAccount[] = JSON.parse(ser);
        addressMapRef.current.set(source, parsed);
      }

      // Extrinsics.
      const getCount = async (status: TxStatus) =>
        (await window.myAPI.sendExtrinsicsTaskAsync({
          action: 'extrinsics:getCount',
          data: { status },
        })) || '0';

      const counts = await Promise.all([
        getCount('pending'),
        getCount('finalized'),
      ]);

      extrinsicCountsRef.current.set('pending', Number(counts[0]));
      extrinsicCountsRef.current.set('finalized', Number(counts[1]));

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
