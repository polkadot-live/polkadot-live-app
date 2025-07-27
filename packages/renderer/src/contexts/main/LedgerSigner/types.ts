// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

export interface LedgerSignerContextInterface {
  ledgerSignSubmit: (info: ExtrinsicInfo) => Promise<void>;
}
