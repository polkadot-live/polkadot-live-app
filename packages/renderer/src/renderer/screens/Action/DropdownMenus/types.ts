// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxStatus } from 'packages/types/src';
import type { AnyData } from '@polkadot-live/types/misc';

export interface CheckboxRxProps {
  selected: boolean;
  theme: AnyData;
  onChecked: () => void;
}

export interface ExtrinsicDropdownMenuProps {
  isBuilt: boolean;
  txStatus: TxStatus;
  onSign: () => void;
  onMockSign: () => void;
  onDelete: () => void;
  onSummaryClick: () => void;
}
