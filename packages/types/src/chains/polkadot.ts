// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js';

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
