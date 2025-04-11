// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainList } from '@ren/config/chains';
import { DedotClient, WsProvider } from 'dedot';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes, FlattenedAPIData } from '@polkadot-live/types/apis';

const isTestEnv = (): boolean => process.env.NODE_ENV === 'test';

export class Api<T extends keyof ClientTypes> {
  api: DedotClient<ClientTypes[T]> | null;
  chain: ChainID;
  endpoint: string;
  rpcs: string[] = [];

  constructor(endpoint: string, chainId: ChainID, rpcs: string[]) {
    this.api = null;
    this.chain = chainId;
    this.endpoint = endpoint;
    this.rpcs = rpcs;
  }

  /**
   * Clear an api if app goes offline.
   */
  clear = () => {
    this.api = null;
  };

  /**
   * Connect to an endpoint.
   */
  connect = async () => {
    try {
      if (this.api && this.status() !== 'disconnected') {
        return;
      }

      const provider = new WsProvider(this.endpoint);
      const api = await DedotClient.new<ClientTypes[T]>({
        provider,
        cacheMetadata: !isTestEnv(),
      });

      const chainId = (await api.rpc.system_chain()) as ChainID;
      if (!ChainList.get(chainId)) {
        await this.disconnect();
      }

      this.api = api;
      this.chain = chainId;
      console.log('⭕ Dedot: %o', this.endpoint, ' CONNECTED');
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
      if (this.api && this.status() !== 'disconnected') {
        await this.api.disconnect();
      }

      this.api = null;
      console.log('❌ Dedot: %o', this.endpoint, ' DISCONNECTED');
    } catch (err) {
      console.log('!disconnect error');
      console.error(err);
    }
  };

  /**
   * Gets client connection status.
   */
  status = () => (this.api ? this.api.status : 'disconnected');

  /**
   * Get serializable API instance data.
   */
  flatten = () =>
    ({
      endpoint: this.endpoint,
      chainId: this.chain,
      status: this.status(),
      rpcs: this.rpcs,
    }) as FlattenedAPIData;
}
