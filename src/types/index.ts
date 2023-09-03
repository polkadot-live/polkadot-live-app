// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnyJson } from '@polkadotlive/types';
import { PolkadotAccountState } from 'main/chains/Polkadot/types';
import { Account } from 'main/model/Account';

// Chain types

export type ChainID = 'Polkadot';

export type ChainStatus = 'connecting' | 'connected' | 'disconnected';

export type SomeChainState = PolkadotAccountState;

export enum AccountType {
  User,
  Delegate,
}

// Account types

export type AccountSource = 'vault' | 'ledger' | 'system';

export type AccountStatus = 'pending' | 'active' | 'does_not_exist';

export type ImportedAccounts = Record<string, Account[]>;

export type StoredAccounts = Record<ChainID, StoredAccount[]>;

export interface AccountConfig {
  config: AnyData;
  chainState: AnyData;
}

export interface StoredAccount {
  _type: AccountType;
  _source: AccountSource;
  _address: string;
  _name: string;
  _config: AnyJson;
  _chainState: AnyJson;
}

// Transaction types

export type TxStatus =
  | 'pending'
  | 'submitted'
  | 'in_block'
  | 'finalized'
  | 'error';


// Any types

// eslint-disable-next-line
export type AnyData = any;
