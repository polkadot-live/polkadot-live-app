// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { U8aLike } from '@polkadot/util/types';

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
  maxNominations: BigNumber;
  sessionsPerEra: BigNumber;
  maxNominatorRewardedPerValidator: BigNumber;
  historyDepth: BigNumber;
  maxElectingVoters: BigNumber;
  expectedBlockTime: BigNumber;
  epochDuration: BigNumber;
  existentialDeposit: BigNumber;
  fastUnstakeDeposit: BigNumber;
  poolsPalletId: U8aLike;
}
