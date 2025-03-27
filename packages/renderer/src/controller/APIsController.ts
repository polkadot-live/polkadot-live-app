// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as ApiUtils from '@ren/utils/ApiUtils';
import { Api } from '@ren/model/Api';
import { ChainList } from '@ren/config/chains';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

/**
 *  A static class that manages active api providers.
 * @class
 * @property {API} instances - a list of the active chain instances.
 */
export class APIsController {
  static instances: Api[] = [];
  static setUiTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  static cachedSetChains: React.Dispatch<
    React.SetStateAction<Map<ChainID, FlattenedAPIData>>
  >;

  /**
   * @name initialize
   * @summary Instantiates a disconnected chain API instance.
   */
  static initialize = (chainIds: ChainID[]) => {
    for (const chainId of chainIds) {
      this.new(chainId);
    }
  };

  /**
   * @name close
   * @summary Disconnect from a chain.
   */
  static close = async (chain: ChainID) => {
    const instance = this.instances.find((s) => s.chain === chain);

    if (instance?.status === 'connected') {
      console.log('🔷 Disconnect chain API instance %o.', chain);
      await instance.disconnect();
      this.updateUiChainState(instance);
    }
  };

  /**
   * @name connectApi
   * @summary Ensures an API instance is connected.
   */
  static connectApi = async (chainId: ChainID) => {
    const instance = this.get(chainId);
    if (!instance) {
      throw new Error(`connectInstance: API for ${chainId} not found`);
    }
    await instance.connect();
    this.set(instance);
    this.updateUiChainState(instance);
  };

  /**
   * @name connectEndpoint
   * @summary Set and connect to a new endpoint for a given chain.
   */
  static connectEndpoint = async (chainId: ChainID, endpoint: string) => {
    const status = this.getStatus(chainId);

    switch (status) {
      case 'disconnected': {
        this.setApiEndpoint(chainId, endpoint);
        break;
      }
      default: {
        await this.close(chainId);
        this.setApiEndpoint(chainId, endpoint);
        await this.connectApi(chainId);
        break;
      }
    }
  };

  /**
   * @name getAllFlattenedAPIData
   * @summary Return an array of all flattened API data for all APIs managed by this class.
   */
  static getAllFlattenedAPIData = (): FlattenedAPIData[] =>
    this.instances.map((api) => api.flatten());

  /**
   * @name getConnectedApi
   * @summary Returns the connected API instance for a specific chain ID.
   */
  static getConnectedApi = async (chainId: ChainID): Promise<Api | null> => {
    if (!this.get(chainId)) {
      throw new Error(`fetchConnectedInstance: API for ${chainId} not found`);
    }
    const instance = this.get(chainId)!;
    switch (instance.status) {
      case 'connected': {
        return instance;
      }
      case 'connecting': {
        // Wait up to 15 seconds for instance to finish connecting.
        const connected = await this.tryConnect(chainId);
        connected && this.updateUiChainState(this.get(chainId)!);
        return connected ? this.get(chainId)! : null;
      }
      case 'disconnected': {
        // Wait up to 30 seconds to connect.
        const result = await Promise.race([
          instance.connect().then(() => true),
          ApiUtils.waitMs(30_000, false),
        ]);

        // Return the connected instance if connection was successful.
        result && this.updateUiChainState(this.get(chainId)!);
        return result ? this.get(chainId)! : null;
      }
    }
  };

  /**
   * @name getConnectedApiOrThrow
   * @summary Same as `getConnectedApi` but throws an error when connection fails.
   */
  static getConnectedApiOrThrow = async (chainId: ChainID, error: string) => {
    const instance = await this.getConnectedApi(chainId);
    if (!instance) {
      throw new Error(`${error} - Could not get API instance.`);
    }
    return instance;
  };

  /**
   * @name getStatus
   * @summary Get status of an API instance.
   */
  static getStatus = (chainId: ChainID) => {
    const instance = this.get(chainId);
    if (!instance) {
      throw new Error(`fetchConnectedInstance: API for ${chainId} not found`);
    }

    return instance.status;
  };

  /**
   * @name get
   * @summary Gets an API instance from the `instances` property.
   */
  private static get = (chain: ChainID): Api | undefined =>
    this.instances?.find((c) => c.chain === chain) || undefined;

  /**
   * @name new
   * @summary Pushes a disconnected API instance to the `instances` property.
   */
  private static new = (chainId: ChainID) => {
    const chainMetaData = ChainList.get(chainId);
    if (!chainMetaData) {
      throw new Error(
        `APIsController::new: Chain metadata not found for chain ID ${chainId}`
      );
    }

    const endpoint = chainMetaData.endpoints.rpcs[0];
    const rpcs = chainMetaData.endpoints.rpcs;

    // Create API instance.
    console.log('🤖 Creating new api interface: %o', endpoint);
    const instance = new Api(endpoint, chainId, rpcs);
    this.instances = [...this.instances, instance];

    console.log(
      '🔧 New api disconnected instances: %o',
      this.instances.map((i) => i.chain)
    );
  };

  /**
   * @name set
   * @summary Updates an API instance in the `instances` property.
   */
  private static set = (instance: Api) =>
    (this.instances =
      this.instances?.map((a) => (a.chain === instance.chain ? instance : a)) ||
      []);

  /**
   * @name setApiEndpoint
   * @summary Set the endpoint for an API instance.
   */
  private static setApiEndpoint = (chainId: ChainID, newEndpoint: string) => {
    const instance = this.get(chainId)!;
    instance.endpoint = newEndpoint;
    this.set(instance);
    this.updateUiChainState(instance);
  };

  /**
   * @name tryConnect
   * @summary Determins if an API instance is connected. Waits a maximum of 15 seconds.
   */
  private static async tryConnect(chainId: ChainID) {
    const MAX_TRIES = 15;
    const INTERVAL_MS = 1_000;

    for (let i = 0; i < MAX_TRIES; ++i) {
      if (this.get(chainId)?.status === 'connected') {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }

    return false;
  }

  /**
   * @name updateUiChainState
   * @summary Updates react state for UI.
   */
  private static updateUiChainState = (instance: Api) => {
    this.cachedSetChains((pv) => pv.set(instance.chain, instance.flatten()));
    this.setUiTrigger(true);
  };
}
