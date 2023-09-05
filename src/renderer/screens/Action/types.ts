// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainID } from '@polkadot-live/types/chains';

export interface SubmitProps {
  txId?: number;
  chain: ChainID;
  submitting: boolean;
  valid: boolean;
  estimatedFee: string;
}
