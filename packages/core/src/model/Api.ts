// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ChainList,
  getChainIdFromRpcChain,
} from '@polkadot-live/consts/chains';
import { DedotClient, SmoldotProvider, WsProvider } from 'dedot';
import { ApiError } from '../errors';
import type {
  ClientTypes,
  FlattenedAPIData,
  NodeEndpoint,
} from '@polkadot-live/types/apis';
import type { ChainID, RpcSystemChain } from '@polkadot-live/types/chains';
import type * as smoldot from 'smoldot/no-auto-bytecode';

export class Api<T extends keyof ClientTypes> {
  api: DedotClient<ClientTypes[T]> | null;
  chainId: ChainID;
  endpoint: NodeEndpoint;
  rpcs: `wss://${string}`[] = [];

  constructor(
    endpoint: NodeEndpoint,
    chainId: ChainID,
    rpcs: `wss://${string}`[],
  ) {
    this.api = null;
    this.chainId = chainId;
    this.endpoint = endpoint;
    this.rpcs = rpcs;
  }

  /**
   * Getter.
   */
  getApi = () => {
    if (this.api === null) {
      throw new ApiError('ApiUndefined');
    }
    return this.api;
  };

  /**
   * Clear an api if app goes offline.
   */
  clear = () => {
    this.api = null;
  };

  /**
   * Utility to get `potentialRelayChains` smoldot argument.
   */
  getPotentialRelayChains = async (
    chainId: ChainID,
    client: smoldot.Client,
  ) => {
    switch (chainId) {
      case 'Polkadot Asset Hub':
      case 'Polkadot People':
        return [
          await client.addChain({
            chainSpec: ChainList.get('Polkadot Relay')!.endpoints.lightClient!,
          }),
        ];
      case 'Kusama Asset Hub':
      case 'Kusama People':
        return [
          await client.addChain({
            chainSpec: ChainList.get('Kusama Relay')!.endpoints.lightClient!,
          }),
        ];
      case 'Westend Asset Hub':
      case 'Westend People':
        return [
          await client.addChain({
            chainSpec: ChainList.get('Westend Relay')!.endpoints.lightClient!,
          }),
        ];
      default:
        return undefined;
    }
  };

  /**
   * Connect to an endpoint.
   */
  connect = async (
    smoldotClient: smoldot.Client | null,
    signal: AbortSignal,
  ): Promise<{ ack: 'success' | 'failure'; error?: ApiError }> => {
    try {
      const throwIfAborted = () => {
        if (signal.aborted) {
          throw new ApiError('ApiConnectAborted');
        }
      };
      if (this.api && this.status() !== 'disconnected') {
        return { ack: 'success' };
      }

      let provider: WsProvider | SmoldotProvider;
      switch (this.endpoint) {
        case 'rpc': {
          provider = new WsProvider(this.rpcs);
          break;
        }
        case 'smoldot': {
          if (!smoldotClient) {
            throw new ApiError('SmoldotClientUndefined');
          }
          // Smoldot chain arguments.
          const chainSpec = ChainList.get(this.chainId)!.endpoints.lightClient;
          if (!chainSpec) {
            throw new ApiError('LightClientChainSpecUndefined');
          }
          throwIfAborted();
          const potentialRelayChains = await this.getPotentialRelayChains(
            this.chainId,
            smoldotClient,
          );
          throwIfAborted();
          const chain = await smoldotClient.addChain({
            chainSpec,
            potentialRelayChains,
          });

          provider = new SmoldotProvider(chain);
          break;
        }
      }

      throwIfAborted();
      const api = await DedotClient.new<ClientTypes[T]>({
        provider,
        cacheMetadata: false,
      });

      const rpcChain = (await api.rpc.system_chain()) as RpcSystemChain;
      const chainId = getChainIdFromRpcChain(rpcChain);

      if (!ChainList.get(chainId)) {
        await this.disconnect();
      }

      throwIfAborted();
      this.api = api;
      this.chainId = chainId;
      console.log('⭕ Dedot: %o', this.endpoint, ' CONNECTED', this.chainId);

      return { ack: 'success' };
    } catch (e) {
      console.error(e);
      const error = e instanceof ApiError ? e : new ApiError('ApiConnectError');
      return { ack: 'failure', error };
    }
  };

  /**
   * Disconnect from a chain.
   */
  disconnect = async () => {
    try {
      if (this.api !== null) {
        await this.api.disconnect();
        this.api = null;
        console.log('❌ Dedot: %o', this.endpoint, ' DISCONNECTED');
      }
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
      chainId: this.chainId,
      status: this.status(),
      rpcs: this.rpcs,
    }) as FlattenedAPIData;
}
