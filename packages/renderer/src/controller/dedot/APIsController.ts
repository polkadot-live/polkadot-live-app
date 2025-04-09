// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Utils from '@ren/utils/CommonUtils';
import { Api as DedotApi } from '@ren/model/dedot/Api';
import { ChainList } from '@ren/config/chains';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes, FlattenedAPIData } from '@polkadot-live/types/apis';

type ChainToKey<T extends ChainID> = T extends 'Polkadot'
  ? 'polkadot'
  : T extends 'Kusama'
    ? 'kusama'
    : 'westend';

export class APIsController {
  static clients: DedotApi<keyof ClientTypes>[] = [];
  static setUiTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  static cachedSetChains: React.Dispatch<
    React.SetStateAction<Map<ChainID, FlattenedAPIData>>
  >;

  /**
   * Initalize disconnected API clients.
   */
  static initialize = (chainIds: ChainID[]) => {
    for (const chainId of chainIds) {
      this.new(chainId);
    }

    // Set react state.
    const map = new Map<ChainID, FlattenedAPIData>();
    this.clients.map((api) => map.set(api.chain, api.flatten()));
    this.cachedSetChains(map);
  };

  /**
   * Disconnect a client.
   */
  static close = async (chainId: ChainID) => {
    const client = this.clients.find((c) => c.chain === chainId);
    if (client?.status() === 'connected') {
      await client.disconnect();
      this.updateUiChainState(client);
    }
  };

  /**
   * Disconnect all clients.
   */
  static closeAll = async () => {
    for (const chainId of ChainList.keys()) {
      await this.close(chainId);
    }
  };

  /**
   * Ensure a client is connected.
   */
  static connectApi = async (chainId: ChainID) => {
    const client = this.get(chainId);
    if (!client) {
      throw new Error(`connectApi: API for ${chainId} not found`);
    }

    await client.connect();
    this.set(client);
    this.updateUiChainState(client);
  };

  /**
   * Set and connect to an endpoint for a given client if online.
   */
  static connectEndpoint = async (chainId: ChainID, endpoint: string) => {
    const status = this.getStatus(chainId);

    switch (status) {
      case 'disconnected': {
        this.setClientEndpoint(chainId, endpoint);
        break;
      }
      default: {
        await this.close(chainId);
        this.setClientEndpoint(chainId, endpoint);
        await this.connectApi(chainId);
        break;
      }
    }
  };

  /**
   * Returns a connected client for a given chain.
   */
  static getConnectedApi = async (
    chainId: ChainID
  ): Promise<DedotApi<keyof ClientTypes> | null> => {
    const client = this.get(chainId)!;
    switch (client.status()) {
      case 'connected': {
        return client;
      }
      case 'reconnecting': {
        // Wait up to 15 seconds for instance to finish connecting.
        const connected = await this.tryConnect(chainId);
        connected && this.updateUiChainState(this.get(chainId)!);
        return connected ? this.get(chainId)! : null;
      }
      case 'disconnected': {
        // Wait up to 30 seconds to connect.
        const result = await Promise.race([
          client.connect().then(() => true),
          Utils.waitMs(30_000, false),
        ]);

        // Return the connected instance if connection was successful.
        result && this.updateUiChainState(this.get(chainId)!);
        return result ? this.get(chainId)! : null;
      }
      default: {
        return null;
      }
    }
  };

  /**
   * Throws an exception when the requested client connection fails.
   */
  static getConnectedApiOrThrow = async (chainId: ChainID) => {
    const client = await this.getConnectedApi(chainId);
    if (!client) {
      throw new Error(`Error - Could not get API instance.`);
    }
    return client;
  };

  /**
   * Get the status of a client.
   */
  static getStatus = (chainId: ChainID) => this.get(chainId)!.status();

  /**
   * Get a client.
   */
  private static get = (chainId: ChainID): DedotApi<keyof ClientTypes> | null =>
    this.clients.find((c) => c.chain === chainId) || null;

  /**
   * Update a client.
   */
  private static set = (client: DedotApi<keyof ClientTypes>) =>
    (this.clients = this.clients.map((c) =>
      c.chain === client.chain ? client : c
    ));

  /**
   * Set client endpoint.
   */
  private static setClientEndpoint = (chainId: ChainID, endpoint: string) => {
    const client = this.get(chainId)!;
    client.endpoint = endpoint;
    this.set(client);
    this.updateUiChainState(client);
  };

  /**
   * Push a disconnected API instance.
   */
  private static new = (chainId: ChainID) => {
    const chainMetaData = ChainList.get(chainId)!;
    const endpoint = chainMetaData.endpoints.rpcs[0];
    const rpcs = chainMetaData.endpoints.rpcs;

    console.log('🤖 Creating new api interface: %o', endpoint);
    const client = this.getClient(chainId, endpoint, rpcs);
    this.clients = [...this.clients, client];
  };

  private static getClient = <T extends ChainID>(
    chainId: T,
    endpoint: string,
    rpcs: string[]
  ): DedotApi<ChainToKey<T>> =>
    new DedotApi<ChainToKey<T>>(endpoint, chainId, rpcs);

  /**
   * Determine if a client is connected after a maximum of 15 seconds.
   */
  private static tryConnect = async (chainId: ChainID): Promise<boolean> => {
    const MAX_TRIES = 15;
    const INTERVAL_MS = 1_000;

    for (let i = 0; i < MAX_TRIES; ++i) {
      if (this.get(chainId)?.status() === 'connected') {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }

    return false;
  };

  /**
   * Update react state.
   */
  private static updateUiChainState = (client: DedotApi<keyof ClientTypes>) => {
    this.cachedSetChains((pv) => pv.set(client.chain, client.flatten()));
    this.setUiTrigger(true);
  };
}
