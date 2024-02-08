// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MethodSubscription } from './blockstream';
import type { AnyJson } from '@polkadot-cloud/react/types';
import type { AnyFunction } from './misc';
import type { PolkadotAccountState } from './chains/polkadot';
import type BigNumber from 'bignumber.js';
import type { ChainID } from './chains';

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
}

// TODO: Pipe more states as more chains are added
export type AccountChainState = PolkadotAccountState;

// Account data saved in Electron store.
export interface StoredAccount {
  _type: AccountType;
  _source: AccountSource;
  _address: string;
  _name: string;
  _config: MethodSubscription;
  _chainState: AccountChainState;
  _chain: ChainID;
  _nominationPoolData: AccountNominationPoolData | null;
}

export interface AccountConfig {
  config: MethodSubscription;
  chainState: AccountChainState;
}

// Type for `Account.state` property
// Currently only supports Polkadot chain instance's state
// TODO: Allow account to store more states
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

// Type storing only essential data for an account.
export interface FlattenedAccountData {
  address: string;
  name: string;
  type: AccountType;
  config: MethodSubscription;
  chainState: AccountChainState;
}

export type FlattenedAccounts = Record<string, FlattenedAccountData[]>;
