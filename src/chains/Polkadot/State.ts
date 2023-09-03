// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { rmCommas } from '@polkadot-cloud/utils';
import { AnyFunction, AnyJson } from '@polkadot-live/types';
import BigNumber from 'bignumber.js';
import { ChainID } from '@polkadot-live/types/chains';
import { APIs } from '@/controller/APIs';
import { Windows } from '@/controller/Windows';
import { MainDebug } from '@/debugging';

const debug = MainDebug.extend('PolkadotState');

export class PolkadotState {
  _chain: ChainID = 'Polkadot';

  _subscribed = false;

  _address: string;

  _existentialDeposit: BigNumber = new BigNumber(0);

  _locks: AnyJson = {};

  _account: AnyJson = {};

  activeSubscriptions: { id: string; unsub: AnyFunction }[] = [];

  constructor(address: string) {
    this._address = address;
    this.subscribe();
  }

  get chain() {
    return this._chain;
  }

  get subscribed() {
    return this._subscribed;
  }

  set subscribed(value: boolean) {
    this._subscribed = value;
  }

  get address() {
    return this._address;
  }

  get existentialDeposit() {
    return this._existentialDeposit;
  }

  set existentialDeposit(value: AnyJson) {
    this._existentialDeposit = value;
  }

  get locks() {
    return this._locks;
  }

  set locks(value: AnyJson) {
    this._locks = value;
  }

  get account() {
    return this._account;
  }

  set account(value: AnyJson) {
    this._account = value;
  }

  getState = (key: keyof PolkadotState) => this[key];

  getAllState() {
    debug('🔗 Getting all state from PolkadotState');
    return {
      account: this.account,
      locks: this.locks,
    };
  }

  reportAccountState(key: keyof PolkadotState) {
    for (const { id } of Windows?.active || []) {
      Windows.get(id)?.webContents?.send(
        'reportAccountState',
        this.chain,
        this.address,
        key,
        this.getState(key)
      );
    }
  }

  async subscribe() {
    debug('📩 Subscribe to account %o ', this.address);
    const apiInstance = APIs.get(this.chain);

    if (this.subscribed || !apiInstance) {
      return;
    }

    this.subscribed = true;
    const { api } = apiInstance;

    const unsub = await api.queryMulti<AnyJson>(
      [
        [api.query.system.account, this.address],
        [api.query.balances.locks, this.address],
      ],
      async ([{ data: accountData, nonce }, locks]) => {
        const free = new BigNumber(accountData.free.toString());

        this.account = {
          nonce: nonce.toNumber(),
          balance: {
            free,
            reserved: new BigNumber(accountData.reserved.toString()),
            frozen: new BigNumber(accountData.frozen.toString()),
            freeAfterReserve: BigNumber.max(
              free.minus(apiInstance.consts.existentialDeposit),
              0
            ),
          },
        };

        debug('💵 Account for %o', this.address);
        this.reportAccountState('account');

        this.locks = locks.toHuman().map((l: AnyJson) => ({
          ...l,
          id: l.id.trim(),
          amount: new BigNumber(rmCommas(l.amount)),
        }));

        debug('🔓 Got locks for : %o', this.address);
        this.reportAccountState('locks');
      }
    );

    this.activeSubscriptions.push({ id: 'auto', unsub });
  }
}
