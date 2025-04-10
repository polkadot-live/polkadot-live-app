// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Utils from '@ren/utils/CommonUtils';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ChainList } from '@ren/config/chains';
import type { ChainID, ChainStatus } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';
import type { ProviderInterface } from '@polkadot/rpc-provider/types';

/**
 * Creates an API instance of a chain.
 * @class
 * @property {ApiPromise | null} api - the API instance of the chain.
 * @property {string | null} chain - the chain name.
 * @property {string} endpoint - the endpoint of the chain.
 * @property {string[]} rpcs - rpc endpoints for connecting to the chain network.
 * @property {ChainStatus} status - API connection status.
 */
export class Api {
  private _api: ApiPromise | null;
  private _chain: ChainID;
  private _endpoint: string;
  private _rpcs: string[] = [];
  private _status: ChainStatus = 'disconnected';

  constructor(endpoint: string, chainId: ChainID, rpcs: string[]) {
    this._chain = chainId;
    this._endpoint = endpoint;
    this._status = 'disconnected';
    this._api = null;
    this._rpcs = rpcs;
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

  get chain() {
    return this._chain;
  }

  set chain(value: ChainID) {
    this._chain = value;
  }

  get endpoint() {
    return this._endpoint;
  }

  set endpoint(value: string) {
    this._endpoint = value;
  }

  get status() {
    return this._status;
  }

  set status(value: ChainStatus) {
    this._status = value;
  }

  /**
   * @name connect
   * @summary Create the `ApiPromise`.
   */
  connect = async () => {
    // Do nothing if instance is already connected.
    if (this.status !== 'disconnected') {
      console.log('🟠 API instance for %o is already connected!', this.chain);
      return;
    }

    this.status = 'connecting';

    // Add listeners to provider before API is ready.
    const provider = new WsProvider(this.endpoint);
    const api = new ApiPromise({ provider });
    this.initEvents(provider);
    await api.isReady;

    const chainId = (await api.rpc.system.chain()).toString() as ChainID;

    // Disconnect and return if chain ID isn't recognized.
    if (!ChainList.get(chainId)) {
      await this.disconnect();
    }

    this.api = api;
    this.chain = chainId;
    this.status = 'connected';
  };

  /**
   * @name initEvents
   * @summary Initialise the event listeners for the provider.
   */
  initEvents = (provider: ProviderInterface) => {
    provider.on('connected', () => {
      console.log('⭕ %o', this.endpoint, ' CONNECTED');
    });

    provider.on('disconnected', async () => {
      console.log('❌ %o', this.endpoint, ' DISCONNECTED');
      this.status = 'disconnected';
    });

    provider.on('error', async () => {
      console.log('❗ %o', this.endpoint, ' ERROR');
      this.status = 'disconnected';
    });
  };

  /**
   * @name disconnect
   * @summary Disconnect from a chain.
   */
  disconnect = async () => {
    // Web socket will disconnect automatically if status goes offline.
    const isOnline: boolean = await Utils.getOnlineStatus();

    if (isOnline && this._api !== null) {
      await this._api.disconnect().catch(console.error);
    }

    // Re-connecting requires a new WsProvider.
    this._api = null;
    this.status = 'disconnected';
  };

  /**
   * @name flatten
   * @summary Return `FlattenedAPIData` for this instance which can be sent to the frontend.
   */
  flatten = () =>
    ({
      endpoint: this.endpoint,
      chainId: this.chain,
      status: this.status,
      rpcs: this._rpcs,
    }) as FlattenedAPIData;
}
