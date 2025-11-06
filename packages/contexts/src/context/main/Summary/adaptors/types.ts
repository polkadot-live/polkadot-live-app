// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
  TxStatus,
} from '@polkadot-live/types';
import type { RefObject, SetStateAction } from 'react';

export interface SummaryAdaptor {
  onMount: (
    addressMapRef: RefObject<Map<AccountSource, ImportedGenericAccount[]>>,
    extrinsicCountsRef: RefObject<Map<TxStatus, number>>,
    setAddressMap: (
      value: SetStateAction<Map<AccountSource, ImportedGenericAccount[]>>
    ) => void,
    setExtrinsicCounts: (value: SetStateAction<Map<TxStatus, number>>) => void
  ) => Promise<void>;
}
