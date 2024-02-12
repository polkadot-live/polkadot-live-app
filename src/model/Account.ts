// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  FlattenedAccountData,
  AccountNominationPoolData,
  AccountType,
} from '@/types/accounts';
import { QueryMultiWrapper } from './QueryMultiWrapper';
import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';

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
 * @property {Set<ChainID>} chains - chains with active subscriptions.
 * @property {Map<ChainID, AccountNominationPoolData>} nominationPoolData - account nomination pool data.
 */
export class Account {
  private _type!: AccountType;

  private _source: AccountSource;

  private _name!: string;

  private _queryMulti: QueryMultiWrapper | null = null;

  // TODO: Change to Map<ChainID, string> when implementing multi-chain support.
  private _address!: string;

  // TODO: Update when enabling and disabling subscriptions.
  private _chains = new Set<ChainID>();

  private _nominationPoolData = new Map<ChainID, AccountNominationPoolData>();

  constructor(
    chain: ChainID,
    type: AccountType,
    source: AccountSource,
    address: string,
    name: string
  ) {
    this.type = type;
    this._source = source;
    this.address = address;
    this.name = name;
    this._queryMulti = new QueryMultiWrapper();
    this._chains.add(chain);
  }

  subscribeToTask = async (task: SubscriptionTask) => {
    await this._queryMulti?.subscribeTask(task);
  };

  getSubscriptionTasks = () => this._queryMulti?.getSubscriptionTasks();

  flatten = () =>
    ({
      address: this.address,
      name: this.name,
      type: this.type,
      nominationPoolData: JSON.stringify(this.nominationPoolData),
      chains: JSON.stringify(this.chains),
      source: this._source,
    }) as FlattenedAccountData;

  toJSON = () => ({
    _type: this._type,
    _source: this._source,
    _address: this._address,
    _name: this._name,
  });

  get chains() {
    return this._chains;
  }

  get type() {
    return this._type;
  }

  set type(value: AccountType) {
    this._type = value;
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

  set nominationPoolData(data: Map<ChainID, AccountNominationPoolData>) {
    this._nominationPoolData = data;
  }
}
