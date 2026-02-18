// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';
import type { SummaryAdapter } from './types';

export const chromeAdapter: SummaryAdapter = {
  onMount: async (
    addressMapRef,
    extrinsicCountsRef,
    setAddressMap,
    setExtrinsicCounts,
  ) => {
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

    // Update state.
    setAddressMap(addressMapRef.current);
    setExtrinsicCounts(extrinsicCountsRef.current);
  },
};
