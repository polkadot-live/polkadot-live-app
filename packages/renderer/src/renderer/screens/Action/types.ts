// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';

export interface SubmitProps {
  txId?: number;
  chain: ChainID;
  submitting: boolean;
  valid: boolean;
  estimatedFee: string;
}
