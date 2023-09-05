// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainID } from '@polkadot-live/types/chains';

export interface SubmitProps {
  txId?: number;
  chain: ChainID;
  submitting: boolean;
  valid: boolean;
  estimatedFee: string;
}
