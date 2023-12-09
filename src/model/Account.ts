// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainsController } from '@/controller/ChainsController';
import type {
  AccountSource,
  AccountChainState,
  AccountChainInstanceState,
  FlattenedAccountData,
} from '@/types/accounts';
import { AccountType } from '@/types/accounts';
import type { MethodSubscription } from '@/types/blockstream';
import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';
import { QueryMultiWrapper } from './QueryMultiWrapper';

/**
 * Account collection types.
 */
export type ImportedAccounts = Map<ChainID, Account[]>;

/**
 * Creates an account.
 * @class
 * @property {AccountType} type - the type of account.
 * @property {string} address - the account address.
 * @property {string} name - the account name.
 * @property {MethodSubscription} config - the account's subscription config.
 * @property {AccountChainState | null} chainState - the cached chain state of the account.
 * @property {AccountChainInstanceState | null} state - instantiated class object that subscribes to base account
 * state.
 */
export class Account {
  private _chain: ChainID;

  private _type!: AccountType;

  private _source: AccountSource;

  private _address!: string;

  private _name!: string;

  private _queryMulti: QueryMultiWrapper | null = null;

  // TODO: Test default method subscription 'all'.
  // Type matches `ConcreteAccount` and `RawAccount`
  private _config: MethodSubscription = { type: 'all' };

  // TODO: Rename either `_chainState` or `state` properties to
  // convey more meaning.
  private _chainState: AccountChainState | null = null;

  state: AccountChainInstanceState | null = null;

  constructor(
    chain: ChainID,
    type: AccountType,
    source: AccountSource,
    address: string,
    name: string
  ) {
    this._chain = chain;
    this.type = type;
    this._source = source;
    this.address = address;
    this.name = name;
    this._queryMulti = new QueryMultiWrapper();
  }

  subscribeToTask = async (task: SubscriptionTask) => {
    await this._queryMulti?.subscribeTask(task);
  };

  getSubscriptionTasks = () => {
    return this._queryMulti?.getSubscriptionTasks();
  };

  initState = () => {
    if (this.type === AccountType.User) {
      this.state = ChainsController.new(this.chain, this.address);
    }
  };

  flatten = () =>
    ({
      address: this.address,
      name: this.name,
      type: this.type,
      config: this.config,
      chainState: this.chainState,
    }) as FlattenedAccountData;

  toJSON = () => ({
    _type: this._type,
    _source: this._source,
    _address: this._address,
    _name: this._name,
    _config: this._config,
    _chainState: this._chainState,
    _chain: this._chain,
  });

  get chain() {
    return this._chain;
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

  get config() {
    return this._config;
  }

  set config(value: MethodSubscription) {
    this._config = value;
  }

  get chainState() {
    return this._chainState;
  }

  set chainState(value: AccountChainState | null) {
    this._chainState = value;
  }
}
