// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxStatus } from 'packages/types/src';

export interface ExtrinsicDropdownMenuProps {
  isBuilt: boolean;
  txStatus: TxStatus;
  onSign: () => void;
  onMockSign: () => void;
  onDelete: () => void;
  onSummaryClick: () => void;
}
