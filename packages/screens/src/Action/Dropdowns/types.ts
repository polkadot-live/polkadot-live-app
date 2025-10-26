// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxStatus } from '@polkadot-live/types/tx';

export interface ExtrinsicDropdownMenuProps {
  isBuilt: boolean;
  hasTxHash: boolean;
  txStatus: TxStatus;
  onSign: () => void;
  onMockSign: () => void;
  onDelete: () => void;
  onSummaryClick: () => void;
  onBlockExplorerClick: () => void;
}
