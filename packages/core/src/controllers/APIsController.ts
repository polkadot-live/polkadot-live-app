// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Api } from '../model';
import { ApiError } from '../errors';
import { waitMs } from '../library/CommonLib';
import { ChainList } from '@polkadot-live/consts/chains';
import type * as smoldot from 'smoldot/no-auto-bytecode';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ApiConnectResult,
  ChainToKey,
  ClientTypes,
  FlattenedAPIData,
  NodeEndpoint,
} from '@polkadot-live/types/apis';

export class APIsController {
  static backend: 'browser' | 'electron';
  static clients: Api<keyof ClientTypes>[] = [];
  static smoldotClient: smoldot.Client | null = null;
  static failedCache = new Map<ChainID, ApiConnectResult<ApiError>>();

  static setUiTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  static cachedSetChains: React.Dispatch<
    React.SetStateAction<Map<ChainID, FlattenedAPIData>>
  >;

  static setFailedConnections: React.Dispatch<
    React.SetStateAction<Map<ChainID, ApiConnectResult<ApiError>>>
  >;

  static syncFailedConnections = () => {
    if (this.backend === 'electron') {
      this.setFailedConnections(new Map(this.failedCache));
    } else {
      chrome.runtime.sendMessage({
        type: 'api',
        task: 'state:failedConnections',
        payload: {
          ser: JSON.stringify(Array.from(this.failedCache.entries())),
        },
      });
    }
  };

  /**
   * Get failed connections from cache.
   */
  static getFailedChainIds = (): ChainID[] =>
    Array.from(this.failedCache.keys());

  /**
   * Initalize disconnected API clients.
   */
  static initialize = async (backend: 'electron' | 'browser') => {
    this.backend = backend;
    const chainIds = ChainList.keys();
    for (const chainId of chainIds) {
      this.new(chainId);
    }
    // Set react state.
    if (this.backend === 'electron') {
      const map = new Map<ChainID, FlattenedAPIData>();
      this.clients.map((c) => map.set(c.chainId, c.flatten()));
      this.cachedSetChains(map);
    }
  };

  /**
   * Disconnect a client.
   */
  static close = async (chainId: ChainID) => {
    const client = this.clients.find((c) => c.chainId === chainId);
    if (!client) {
      return;
    }
    const timeout = this.getConnectionTimeout(chainId);
    const success = await Promise.race([
      client.disconnect().then(() => true),
      waitMs(timeout).then(() => false),
    ]);

    !success && this.reset(chainId);
    this.updateUiChainState(this.clients.find((c) => c.chainId === chainId)!);
  };

  /**
   * Reset throws away a timed-out client and re-creates it.
   */
  static reset = (chainId: ChainID) => {
    this.resetClient(chainId);
    this.setFailedCache(chainId, new ApiError('ApiConnectTimeout'));
    this.resetState(chainId);
  };

  /**
   * Reset helpers.
   */
  static resetClient = (chainId: ChainID) => {
    this.clients = this.clients.filter((c) => {
      if (c.chainId === chainId) {
        c.disconnect();
        return false;
      }
      return true;
    });
    this.new(chainId);
  };

  // Update React state.
  static resetState = (chainId: ChainID) => {
    this.syncFailedConnections();
    this.updateUiChainState(this.clients.find((c) => c.chainId === chainId)!);
  };

  // Update controller failed cache.
  static setFailedCache = (chainId: ChainID, error: ApiError) => {
    this.failedCache.set(chainId, { ack: 'failure', chainId, error });
  };

  /**
   * Disconnect all clients.
   */
  static closeAll = async () => {
    const chainIds = Array.from(ChainList.keys());
    await Promise.all(chainIds.map((c) => this.close(c)));
  };

  /**
   * Get timeout duration for RPC or light client connection.
   */
  static getConnectionTimeout = (chainId: ChainID) =>
    this.getEndpoint(chainId) === 'smoldot' ? 120_000 : 12_000;

  /**
   * Set and connect to an endpoint for a given client if online.
   */
  static setEndpoint = async (
    chainId: ChainID,
    endpoint: NodeEndpoint
  ): Promise<void> => {
    switch (this.getStatus(chainId)) {
      case 'disconnected': {
        this.setClientEndpoint(chainId, endpoint);
        break;
      }
      default: {
        await this.close(chainId);
        this.setClientEndpoint(chainId, endpoint);
        break;
      }
    }
  };

  /**
   * Returns a connected client for a given chain.
   */
  static getConnectedApi = async (chainId: ChainID) => {
    const client = this.get(chainId);
    if (!client) {
      return null;
    }
    switch (client.status()) {
      case 'connected': {
        return this.castClient(chainId, client);
      }
      case 'reconnecting': {
        // Wait up to 15 seconds for instance to finish connecting.
        const connected = await this.tryConnect(chainId);
        connected && this.updateUiChainState(this.get(chainId)!);
        return connected ? this.castClient(chainId, this.get(chainId)!) : null;
      }
      case 'disconnected': {
        const controller = new AbortController();
        const timeout = this.getConnectionTimeout(chainId);

        const { ack } = await Promise.race([
          client.connect(this.smoldotClient, controller.signal),
          waitMs(timeout).then(() => {
            controller.abort();
            return { ack: 'failure' };
          }),
        ]);

        if (ack === 'failure') {
          return null;
        }
        // Return the connected instance if connection was successful.
        this.updateUiChainState(this.get(chainId)!);
        return this.castClient(chainId, this.get(chainId)!);
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
    if (client === null) {
      throw new ApiError('CouldNotGetConnectedApi');
    }
    return client;
  };

  /**
   * Utility to cast an API client to a specific chain.
   */
  static castClient = (chainId: ChainID, client: Api<keyof ClientTypes>) => {
    switch (chainId) {
      case 'Polkadot Relay':
        return client as Api<'polkadot'>;
      case 'Polkadot Asset Hub':
        return client as Api<'statemint'>;
      case 'Polkadot People':
        return client as Api<'people-polkadot'>;
      case 'Kusama Relay':
        return client as Api<'kusama'>;
      case 'Kusama Asset Hub':
        return client as Api<'statemine'>;
      case 'Kusama People':
        return client as Api<'people-kusama'>;
      case 'Paseo Relay':
        return client as Api<'paseo'>;
      case 'Paseo Asset Hub':
        return client as Api<'asset-hub-paseo'>;
      case 'Paseo People':
        return client as Api<'people-paseo'>;
      case 'Westend Relay':
        return client as Api<'westend'>;
      case 'Westend Asset Hub':
        return client as Api<'westmint'>;
      case 'Westend People':
        return client as Api<'people-westend'>;
    }
  };

  /**
   * Get the status of a client.
   */
  static getStatus = (chainId: ChainID) => this.get(chainId)!.status();

  /**
   * Get a client.
   */
  private static get = (chainId: ChainID): Api<keyof ClientTypes> | null =>
    this.clients.find((c) => c.chainId === chainId) || null;

  /**
   * Update a client.
   */
  private static set = (client: Api<keyof ClientTypes>) =>
    (this.clients = this.clients.map((c) =>
      c.chainId === client.chainId ? client : c
    ));

  /**
   * Set client endpoint.
   */
  private static setClientEndpoint = (
    chainId: ChainID,
    endpoint: NodeEndpoint
  ) => {
    const client = this.get(chainId)!;
    client.endpoint = endpoint;
    this.set(client);
    this.updateUiChainState(client);
  };

  /**
   * Get client endoint.
   */
  static getEndpoint = (chainId: ChainID): NodeEndpoint =>
    this.get(chainId)!.endpoint;

  /**
   * Push a disconnected API instance.
   */
  private static new = (chainId: ChainID) => {
    if (this.clients.find((a) => a.chainId === chainId)) {
      return;
    }
    const chainMetaData = ChainList.get(chainId)!;
    const rpcs = chainMetaData.endpoints.rpcs;

    console.log('🤖 Creating new api interface: %o', chainId);
    const client = this.getClient(chainId, rpcs);
    this.clients = [...this.clients, client];
  };

  private static getClient = <T extends ChainID>(
    chainId: T,
    rpcs: `wss://${string}`[]
  ): Api<ChainToKey<T>> => new Api<ChainToKey<T>>('rpc', chainId, rpcs);

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
  private static updateUiChainState = (client: Api<keyof ClientTypes>) => {
    switch (this.backend) {
      case 'browser': {
        const ser = JSON.stringify(client.flatten());
        const msg = { type: 'api', task: 'state:chain', payload: { ser } };
        chrome.runtime.sendMessage(msg);
        break;
      }
      case 'electron': {
        const c = client;
        this.cachedSetChains((pv) => new Map(pv).set(c.chainId, c.flatten()));
        this.setUiTrigger(true);
        break;
      }
    }
  };

  /**
   * Sync chain state on popup reload (extension).
   */
  static syncChainConnections = () => {
    const map = new Map<ChainID, FlattenedAPIData>();
    this.clients.map((client) => map.set(client.chainId, client.flatten()));
    const ser = JSON.stringify(Array.from(map.entries()));
    const msg = { type: 'api', task: 'state:onPopupReload', payload: { ser } };
    chrome.runtime.sendMessage(msg);
  };
}
