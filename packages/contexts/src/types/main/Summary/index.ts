// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { TxStatus } from '@polkadot-live/types/tx';

export interface SummaryContextInterface {
  addressMap: Map<AccountSource, ImportedGenericAccount[]>;
  extrinsicCounts: Map<TxStatus, number>;
}
