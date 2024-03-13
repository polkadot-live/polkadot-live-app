// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson, AnyFunction } from './misc';
import type { PolkadotAccountState } from './chains/polkadot';
import type BigNumber from 'bignumber.js';
import type { ChainID } from './chains';

export type AccountSource = 'vault' | 'ledger' | 'system';

export type AccountStatus = 'pending' | 'active' | 'does_not_exist';

/*
 * Essential account data mapped to chain ID.
 */
export type FlattenedAccounts = Map<ChainID, FlattenedAccountData[]>;

/*
 * Account's associated nomination pool data.
 */
export interface AccountNominationPoolData {
  poolId: number;
  poolRewardAddress: string;
  poolPendingRewards: BigNumber;
}

/*
 * Account data saved in Electron store.
 */
export interface StoredAccount {
  _source: AccountSource;
  _address: string;
  _name: string;
}

/*
 * Type storing essential data for an account.
 */
export interface FlattenedAccountData {
  address: string;
  chain: ChainID;
  name: string;
  nominationPoolData: AccountNominationPoolData | null;
  source: AccountSource;
}

/**
 * Vault address type for import window.
 */
export interface LocalAddress {
  address: string;
  isImported: boolean;
  index: number;
}

/**
 * Ledger address type for import window.
 */

export interface LedgerLocalAddress {
  address: string;
  device: { id: string; productName: string };
  index: number;
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
