// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';
import { rmCommas } from '@polkadot-cloud/utils';
import { AnyJson } from '@polkadotlive/types';
import BigNumber from 'bignumber.js';
import { ChainID, ChainStatus } from 'types/index';
import { APIConstants } from '@polkadot-live/types/chains/polkadot';
import { Windows } from '../controller/Windows';
import { MainDebug } from '../debug';

const debug = MainDebug.extend('API');

/**
 * Creates an API instance of a chain.
 * @class
 * @property {string} endpoint - the endpoint of the chain.
 * @property {WsProvider} provider - the provider of the chain.
 * @property {ApiPromise | null} api - the API instance of the chain.
 * @property {string | null} chain - the chain name.
 * @property {APIConstants | null} consts - the constants of the chain.
 */
export class API {
  private _endpoint: string;

  private _provider: WsProvider;

  private _api: ApiPromise | null = null;

  private _status: ChainStatus = 'disconnected';

  private _chain: ChainID | null = null;

  private _consts: APIConstants | null = null;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.provider = new WsProvider(endpoint);
    this.initEvents();
  }

  get endpoint() {
    return this._endpoint;
  }

  set endpoint(value: string) {
    this._endpoint = value;
  }

  get api() {
    return this._api;
  }

  set api(value: ApiPromise) {
    this._api = value;
  }

  get status() {
    return this._status;
  }

  set status(value: ChainStatus) {
    this._status = value;
  }

  get chain() {
    return this._chain;
  }

  set chain(value: ChainID) {
    this._chain = value;
  }

  get provider() {
    return this._provider;
  }

  set provider(value: WsProvider) {
    this._provider = value;
  }

  get consts() {
    return this._consts;
  }

  set consts(value: AnyJson) {
    this._consts = value;
  }

  /**
   * @name setApi
   * @summary Set instance API properties.
   * @param {string} api - the api instance.
   * @param {ChainID} chain - the chain the account belongs to.
   */
  setApi = (api: ApiPromise, chain: ChainID) => {
    this.api = api;
    this.chain = chain;
    debug.extend(this.chain)(
      '🛠️  Bootstrap accounts via event listener for %o',
      this.chain
    );
  };

  /**
   * @name initEvents
   * @summary Initialise the event listeners for the provider.
   */
  initEvents = () => {
    this.provider.on('connected', () => {
      debug('⭕ %o', this.endpoint, ' CONNECTED');
      this.status = 'connected';
      Windows.reportAll(this.chain, 'connnected');
    });

    this.provider.on('disconnected', () => {
      debug('❌ %o', this.endpoint, ' DISCONNECTED');
      this.status = 'disconnected';
      Windows.reportAll(this.chain, 'disconnnected');
    });

    this.provider.on('error', () => {
      debug('❗ %o', this.endpoint, ' ERROR');
      this.status = 'disconnected';
      Windows.reportAll(this.chain, 'disconnnected');
    });
  };

  /**
   * @name getConsts
   * @summary Bootstrap chain constants.
   */
  getConsts = async () => {
    const { api } = this;

    debug.extend(this.chain)('🛠️ Bootstrapping constants');
    const result = await Promise.all([
      api.consts.staking.bondingDuration,
      api.consts.staking.maxNominations,
      api.consts.staking.sessionsPerEra,
      api.consts.staking.maxNominatorRewardedPerValidator,
      api.consts.electionProviderMultiPhase.maxElectingVoters,
      api.consts.babe.expectedBlockTime,
      api.consts.babe.epochDuration,
      api.consts.balances.existentialDeposit,
      api.consts.staking.historyDepth,
      api.consts.fastUnstake.deposit,
      api.consts.nominationPools.palletId,
    ]);

    const bondDuration = new BigNumber(rmCommas(result[0].toString()));
    const maxNominations = new BigNumber(rmCommas(result[1].toString()));
    const sessionsPerEra = new BigNumber(rmCommas(result[2].toString()));
    const maxNominatorRewardedPerValidator = new BigNumber(
      rmCommas(result[3].toString())
    );
    const maxElectingVoters = new BigNumber(rmCommas(result[4].toString()));
    const expectedBlockTime = new BigNumber(rmCommas(result[5].toString()));
    const epochDuration = new BigNumber(rmCommas(result[6].toString()));
    const existentialDeposit = new BigNumber(rmCommas(result[7].toString()));
    const historyDepth = new BigNumber(rmCommas(result[8].toString()));
    const fastUnstakeDeposit = new BigNumber(rmCommas(result[9].toString()));
    const poolsPalletId = result[10].toU8a();

    const consts = {
      bondDuration,
      maxNominations,
      sessionsPerEra,
      maxNominatorRewardedPerValidator,
      historyDepth,
      maxElectingVoters,
      epochDuration,
      expectedBlockTime,
      poolsPalletId,
      existentialDeposit,
      fastUnstakeDeposit,
    };

    this.consts = consts;
  };

  /**
   * @name disconnect
   * @summary Disconnect from a chain.
   */
  disconnect = async () => {
    await this.api?.disconnect();
    await this.provider.disconnect();
  };
}
