// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainID } from './chains';
import { AnyData, AnyJson } from './misc';

export enum AccountType {
  User,
  Delegate,
}

export type AccountSource = 'vault' | 'ledger' | 'system';

export type AccountStatus = 'pending' | 'active' | 'does_not_exist';

// TODO: `AnyData` here should be `Account model`.
export type ImportedAccounts = Record<string, AnyData[]>;

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
