// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

export interface SignLedgerOverlayProps {
  info: ExtrinsicInfo;
}

export interface SignWcOverlayProps {
  info: ExtrinsicInfo;
}
export interface SignVaultOverlayProps {
  from: string;
  txId: string;
}
