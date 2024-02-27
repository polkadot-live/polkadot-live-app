// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ApiPromise, WsProvider } from '@polkadot/api';
import BigNumber from 'bignumber.js';
import { MainDebug } from '@/utils/DebugUtils';
import { rmCommas } from '@w3ux/utils';
import { WindowsController } from '@/controller/WindowsController';
import { ChainList } from '@/config/chains';
import type { AnyJson } from '@/types/misc';
import type { APIConstants } from '@/types/chains/polkadot';
import type { Codec } from '@polkadot/types-codec/types';
import type { ChainID, ChainStatus } from '@/types/chains';
import type { FlattenedAPIData } from '@/types/apis';
import type { ProviderInterface } from '@polkadot/rpc-provider/types';

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

  private _provider: ProviderInterface | null;

  private _api: ApiPromise | null;

  private _chain: ChainID;

  private _status: ChainStatus = 'disconnected';

  private _consts: APIConstants | null = null;

  constructor(endpoint: string, chainId: ChainID) {
    this._chain = chainId;
    this._endpoint = endpoint;
    this._status = 'disconnected';
    this._provider = null;
    this._api = null;
  }

  /**
   * @name connect
   * @summary Create the `ApiPromise` and get consts with metadata.
   */
  connect = async () => {
    // Do nothing if instance is already connected.
    if (this.status !== 'disconnected') {
      debug('🟠 API instance for %o is already connected!', this.chain);
      return;
    }

    this.status = 'connecting';

    // Add listeners to provider.
    const provider = new WsProvider(this.endpoint);
    this._provider = provider;

    // Add listeners before API is ready.
    const api = new ApiPromise({ provider: this._provider });
    this.initEvents();
    await api.isReady;

    const chainId = (await api.rpc.system.chain()).toString();

    // Disconnect and return if chain ID isn't recognized.
    if (!ChainList.get(chainId as ChainID)) {
      await this.disconnect();
    }

    this.setApi(api, chainId as ChainID);
    await this.getConsts();
  };

  get endpoint() {
    return this._endpoint;
  }

  set endpoint(value: string) {
    this._endpoint = value;
  }

  get api(): ApiPromise {
    if (!this._api) {
      throw new Error('_api property is null');
    } else {
      return this._api;
    }
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

  set provider(value: ProviderInterface | null) {
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
   * @param {ApiPromise} api - the api instance.
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
    this.provider?.on('connected', () => {
      debug('⭕ %o', this.endpoint, ' CONNECTED');
      this.status = 'connected';
      WindowsController.reportAll(this.chain, 'renderer:chain:connnected');
    });

    this.provider?.on('disconnected', () => {
      debug('❌ %o', this.endpoint, ' DISCONNECTED');
      this.status = 'disconnected';
      WindowsController.reportAll(this.chain, 'renderer:chain:disconnnected');
    });

    this.provider?.on('error', () => {
      debug('❗ %o', this.endpoint, ' ERROR');
      this.status = 'disconnected';
      WindowsController.reportAll(this.chain, 'renderer:chain:disconnnected');
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
      api.consts.staking.sessionsPerEra,
      api.consts.babe.expectedBlockTime,
      api.consts.babe.epochDuration,
      api.consts.balances.existentialDeposit,
      api.consts.staking.historyDepth,
      api.consts.fastUnstake.deposit,
      api.consts.nominationPools.palletId,
    ]);

    const takeResult = (item: Codec[], index: number) =>
      new BigNumber(rmCommas(item[index].toString()));

    const bondDuration = takeResult(result, 0);
    const sessionsPerEra = takeResult(result, 1);
    const expectedBlockTime = takeResult(result, 2);
    const epochDuration = takeResult(result, 3);
    const existentialDeposit = takeResult(result, 4);
    const historyDepth = takeResult(result, 5);
    const fastUnstakeDeposit = takeResult(result, 6);
    const poolsPalletId = result[7].toU8a();

    const consts = {
      bondDuration,
      sessionsPerEra,
      historyDepth,
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
    this._api &&
      this._api.isConnected &&
      (await this._api.disconnect().catch(console.error));

    this._provider &&
      this._provider.isConnected &&
      this._provider.disconnect().catch(console.error);

    this.provider = null;
    this._api = null;
    this.status = 'disconnected';

    // TODO: Get disconnect working.
    debug('🔴 Get disconnect working.');
  };

  /**
   * @name flatten
   * @summary Return `FlattenedAPIData` for this instance which can be sent to
   * the frontend.
   */
  flatten = () =>
    ({
      endpoint: this.endpoint,
      chainId: this.chain,
      status: this.status,
    }) as FlattenedAPIData;
}
