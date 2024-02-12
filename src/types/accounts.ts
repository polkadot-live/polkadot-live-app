// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MethodSubscription } from './blockstream';
import type { AnyJson } from '@polkadot-cloud/react/types';
import type { AnyFunction } from './misc';
import type { PolkadotAccountState } from './chains/polkadot';
import type BigNumber from 'bignumber.js';

export enum AccountType {
  User,
  Delegate,
}

export type AccountSource = 'vault' | 'ledger' | 'system';

export type AccountStatus = 'pending' | 'active' | 'does_not_exist';

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
  _type: AccountType;
  _source: AccountSource;
  _address: string;
  _name: string;
}

/*
 * Type storing only essential data for an account.
 */
export interface FlattenedAccountData {
  address: string;
  name: string;
  type: AccountType;
  config: MethodSubscription;
  chains: string;
  nominationPoolData: string;
  source: AccountSource;
}

export type FlattenedAccounts = Record<string, FlattenedAccountData[]>;

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

  // The following method is not being invoked from this type yet:
  // reportAccountState(key: keyof PolkadotState)
}
