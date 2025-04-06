// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson, AnyFunction } from './misc';
import type { PolkadotAccountState } from './chains/polkadot';
import type BigNumber from 'bignumber.js';
import type { ChainID } from './chains';

export type AccountSource =
  | 'vault'
  | 'ledger'
  | 'system'
  | 'read-only'
  | 'wallet-connect';

export type AccountStatus = 'pending' | 'active' | 'does_not_exist';

/*
 * Essential account data mapped to chain ID.
 */
export type FlattenedAccounts = Map<ChainID, FlattenedAccountData[]>;

/*
 * Account's balances.
 */
export interface AccountBalance {
  nonce: bigint;
  free: bigint;
  reserved: bigint;
  frozen: bigint;
}

/*
 * Account's associated nomination pool data.
 */
export interface AccountNominationPoolData {
  poolId: number;
  poolRewardAddress: string;
  poolPendingRewards: string;
  poolState: string;
  poolName: string;
  poolRoles: NominationPoolRoles;
  poolCommission: NominationPoolCommission;
}

export interface NominationPoolRoles {
  depositor: string;
  root: string;
  nominator: string;
  bouncer: string;
}

export interface NominationPoolCommission {
  changeRate: null | {
    maxIncrease: string;
    minDelay: string;
  };
  current: null | string[];
  max: null | string;
  throttleFrom: null | string;
}

/*
 * Account's nominating pool data.
 */

export interface AccountNominatingData {
  exposed: boolean;
  lastCheckedEra: number;
  submittedIn: number;
  validators: ValidatorData[];
}

export interface ValidatorData {
  validatorId: string;
  commission: string;
}

/*
 * Account data saved in Electron store.
 */
export interface StoredAccount {
  _address: string;
  _chain: ChainID;
  _name: string;
  _source: AccountSource;
}

/**
 * Account JSON representation.
 */
export interface AccountJson {
  _address: string;
  _chain: ChainID;
  _name: string;
  _source: AccountSource;
}

/*
 * Type storing essential data for an account.
 */
export interface FlattenedAccountData {
  address: string;
  chain: ChainID;
  name: string;
  nominationPoolData: AccountNominationPoolData | null;
  nominatingData: AccountNominatingData | null;
  source: AccountSource;
}

/**
 * Vault address type for import window.
 */
export interface LocalAddress {
  address: string;
  isImported: boolean;
  name: string;
  source: AccountSource;
}

/**
 * Ledger address type for import window.
 */

export interface LedgerLocalAddress {
  address: string;
  device: { id: string; productName: string };
  index?: number;
  isImported: boolean;
  name: string;
  pubKey: string;
}

/**
 * @deprecated The type should not be used
 */
export type AccountChainState = PolkadotAccountState;

// Type for `Account.state` property
// Currently only supports Polkadot chain instance's state

/**
 * @deprecated The type should not be used
 */
export interface AccountChainInstanceState {
  _account: AnyJson; // TODO: fix type
  _address: string;
  _chain: string;
  _existentialDeposit: BigNumber;
  _locks: AnyJson; // TODO: fix type
  _subscribed: boolean;
  activeSubscriptions: { id: string; unsub: AnyFunction }[];

  subscribe: () => void;
  getAllState: () => { account: AnyJson; locks: AnyJson };
}
