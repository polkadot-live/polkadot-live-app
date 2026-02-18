// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { TxStatus } from '@polkadot-live/types/tx';
import type { SummaryAdapter } from './types';

export const electronAdapter: SummaryAdapter = {
  onMount: async (
    addressMapRef,
    extrinsicCountsRef,
    setAddressMap,
    setExtrinsicCounts,
  ) => {
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

    // Update state.
    setAddressMap(addressMapRef.current);
    setExtrinsicCounts(extrinsicCountsRef.current);
  },
};
