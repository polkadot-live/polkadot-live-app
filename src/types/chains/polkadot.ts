// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js';
import type { U8aLike } from '@polkadot/util/types';

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

export interface APIConstants {
  bondDuration: BigNumber;
  sessionsPerEra: BigNumber;
  maxNominatorRewardedPerValidator: BigNumber;
  historyDepth: BigNumber;
  expectedBlockTime: BigNumber;
  epochDuration: BigNumber;
  existentialDeposit: BigNumber;
  fastUnstakeDeposit: BigNumber;
  poolsPalletId: U8aLike;
}
