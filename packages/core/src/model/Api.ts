// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ChainList,
  getChainIdFromRpcChain,
} from '@polkadot-live/consts/chains';
import { DedotClient, SmoldotProvider, WsProvider } from 'dedot';
import type * as smoldot from 'smoldot/no-auto-bytecode';
import type { ChainID, RpcSystemChain } from '@polkadot-live/types/chains';
import type {
  ClientTypes,
  FlattenedAPIData,
  NodeEndpoint,
} from '@polkadot-live/types/apis';

const isTestEnv = (): boolean => process.env.NODE_ENV === 'test';

export class Api<T extends keyof ClientTypes> {
  api: DedotClient<ClientTypes[T]> | null;
  chainId: ChainID;
  endpoint: NodeEndpoint;
  rpcs: NodeEndpoint[] = [];

  constructor(endpoint: NodeEndpoint, chainId: ChainID, rpcs: NodeEndpoint[]) {
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
      throw Error('api is null');
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
    client: smoldot.Client
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
  connect = async (smoldotClient: smoldot.Client | null) => {
    try {
      if (this.api && this.status() !== 'disconnected') {
        return;
      }

      let provider: WsProvider | SmoldotProvider;
      if (this.endpoint === 'smoldot') {
        if (!smoldotClient) {
          throw new Error('Error - smoldot client is null.');
        }

        // Smoldot chain arguments.
        const chainSpec = ChainList.get(this.chainId)!.endpoints.lightClient;
        if (!chainSpec) {
          throw new Error('Error - Light client chainspec is undefined.');
        }

        const potentialRelayChains = await this.getPotentialRelayChains(
          this.chainId,
          smoldotClient
        );

        const chain = await smoldotClient.addChain({
          chainSpec,
          potentialRelayChains,
        });

        provider = new SmoldotProvider(chain);
      } else {
        provider = new WsProvider(this.endpoint);
      }

      const api = await DedotClient.new<ClientTypes[T]>({
        provider,
        cacheMetadata: !isTestEnv(),
      });

      const rpcChain = (await api.rpc.system_chain()) as RpcSystemChain;
      const chainId = getChainIdFromRpcChain(rpcChain);

      if (!ChainList.get(chainId)) {
        await this.disconnect();
      }

      this.api = api;
      this.chainId = chainId;
      console.log('⭕ Dedot: %o', this.endpoint, ' CONNECTED', this.chainId);
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
        this.api = null;
      }
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
      chainId: this.chainId,
      status: this.status(),
      rpcs: this.rpcs,
    }) as FlattenedAPIData;
}
