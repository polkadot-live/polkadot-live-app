// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QueryMultiWrapper } from './QueryMultiWrapper';
import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';
import type {
  AccountSource,
  FlattenedAccountData,
  AccountNominationPoolData,
} from '@/types/accounts';

/**
 * Account collection types.
 */
export type ImportedAccounts = Map<ChainID, Account[]>;

/**
 * Creates an account.
 * @class
 * @property {AccountType} type - the type of account.
 * @property {AccountSource} source - account import method.
 * @property {string} address - the account address.
 * @property {string} name - the account name.
 * @property {QueryMultiWrapper} queryMulti - subscription manager object.
 * @property {hainID} chain - chain account belongs to.
 * @property {Map<ChainID, AccountNominationPoolData>} nominationPoolData - account nomination pool data.
 */
export class Account {
  private _source: AccountSource;

  private _name: string;

  private _queryMulti: QueryMultiWrapper | null = null;

  private _address!: string;

  private _chain: ChainID;

  private _nominationPoolData: AccountNominationPoolData | null = null;

  constructor(
    chain: ChainID,
    source: AccountSource,
    address: string,
    name: string
  ) {
    this._source = source;
    this.address = address;
    this._name = name;
    this._queryMulti = new QueryMultiWrapper();
    this._chain = chain;
  }

  subscribeToTask = async (task: SubscriptionTask) => {
    await this._queryMulti?.subscribeTask(task);
  };

  getSubscriptionTasks = () => this._queryMulti?.getSubscriptionTasks();

  flatten = () =>
    ({
      address: this.address,
      chain: this.chain,
      name: this.name,
      nominationPoolData: this.nominationPoolData,
      source: this.source,
    }) as FlattenedAccountData;

  toJSON = () => ({
    _source: this._source,
    _address: this._address,
    _name: this._name,
    _chain: this._chain,
  });

  get chain() {
    return this._chain;
  }

  get source() {
    return this._source;
  }

  set source(value: AccountSource) {
    this._source = value;
  }

  get address() {
    return this._address;
  }

  set address(value: string) {
    this._address = value;
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get nominationPoolData() {
    return this._nominationPoolData;
  }

  set nominationPoolData(data: AccountNominationPoolData | null) {
    this._nominationPoolData = data;
  }

  get queryMulti() {
    return this._queryMulti;
  }
}
