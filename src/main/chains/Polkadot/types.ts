// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';

export interface PolkadotAccountState {
  inNominationPool: null | {
    poolId: string;
  };
}

export interface Balances {
  address?: string;
  nonce?: number;
  balance?: Balance;
  locks?: BalanceLock[];
}

export interface Balance {
  free: BigNumber;
  reserved: BigNumber;
  frozen: BigNumber;
  freeAfterReserve: BigNumber;
}
export interface BalanceLock {
  id: string;
  amount: BigNumber;
  reasons: string;
}
