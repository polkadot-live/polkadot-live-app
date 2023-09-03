// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnyJson , AccountSource, AccountType } from '@polkadot-live/types';
import { ChainState } from '../controller/ChainState';
import { ChainID } from '@polkadot-live/types/chains';

/**
 * Creates an account.
 * @class
 * @property {AccountType} type - the type of account.
 * @property {string} address - the account address.
 * @property {string} name - the account name.
 * @property {AnyJson | null} config - the account's subscription config.
 * @property {AnyJson | null} chainState - the cached chain state of the account.
 * @property {AnyJson | null} chainState - instantiated class object that subscribes to base account
 * state.
 */
export class Account {
  private _chain: ChainID;

  private _type: AccountType;

  private _source: AccountSource;

  private _address: string;

  private _name: string;

  private _config: AnyJson | null = null;

  private _chainState: AnyJson | null = null;

  state: AnyJson | null = null;

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

    if (type === AccountType.User) {
      this.state = ChainState.new(chain, address);
    }
  }

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

  set config(value: AnyJson) {
    this._config = value;
  }

  get chainState() {
    return this._chainState;
  }

  set chainState(value: AnyJson) {
    this._chainState = value;
  }

  format = () => ({
    address: this.address,
    name: this.name,
    type: this.type,
    config: this.config,
    chainState: this.chainState,
  });
}
