// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DedotClient, WsProvider } from 'dedot';
import { ChainList } from '@ren/config/chains';
import type { ChainID, ChainStatus } from '@polkadot-live/types/chains';
import type { ClientTypes, FlattenedAPIData } from '@polkadot-live/types/apis';

export class Api<T extends keyof ClientTypes> {
  private _api: DedotClient<ClientTypes[T]> | null;
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

  get api(): DedotClient<ClientTypes[T]> {
    if (!this._api) {
      throw new Error('_api property is null');
    } else {
      return this._api;
    }
  }

  set api(value: DedotClient<ClientTypes[T]> | null) {
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
   * Connect to an endpoint.
   */
  connect = async () => {
    try {
      if (this.status !== 'disconnected') {
        return;
      }

      this.status = 'reconnecting';
      const provider = new WsProvider(this.endpoint);
      this.initEvents(provider);
      const api = await DedotClient.new<ClientTypes[T]>({
        provider,
        cacheMetadata: true,
      });

      const chainId = (await api.rpc.system_chain()) as ChainID;
      if (!ChainList.get(chainId)) {
        await this.disconnect();
      }

      this.api = api;
      this.chain = chainId;
      this.status = 'connected';
    } catch (err) {
      console.log('!connect error');
      console.error(err);
    }
  };

  /**
   * Disconnect from a chain.
   */
  disconnect = async () => {
    try {
      if (this.api !== null) {
        await this.api.disconnect();
      }

      this.api = null;
      this.status = 'disconnected';
    } catch (err) {
      console.log('!disconnect error');
      console.error(err);
    }
  };

  /**
   * Get serializable API instance data.
   */
  flatten = () =>
    ({
      endpoint: this.endpoint,
      chainId: this.chain,
      status: this.status,
      rpcs: this._rpcs,
    }) as FlattenedAPIData;

  /**
   * Initialise client event handlers.
   */
  initEvents = (provider: WsProvider) => {
    provider.on('connected', () => {
      console.log('⭕ %o', this.endpoint, ' CONNECTED');
    });
    provider.on('disconnected', () => {
      console.log('❌ %o', this.endpoint, ' DISCONNECTED');
      this.status = 'disconnected';
    });
    provider.on('error', () => {
      console.log('❗ %o', this.endpoint, ' ERROR');
      this.status = 'disconnected';
    });
  };
}
