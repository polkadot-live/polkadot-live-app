// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Api } from '@/model/Api';
import { ChainList } from '@/config/chains';
import type { ChainID } from '@/types/chains';
import type { FlattenedAPIData } from '@/types/apis';

/**
 *  A static class that manages active api providers.
 * @class
 * @property {API} instances - a list of the active chain instances.
 */
export class APIsController {
  static instances: Api[] = [];

  /**
   * @name initialize
   * @summary Instantiates a disconnected API instance for each supported chain.
   */
  static initialize = (chainIds: ChainID[]) => {
    for (const chainId of chainIds) {
      this.new(chainId);
    }
  };

  /**
   * @name new
   * @summary Instantiates a new disconnected API instance and adds it to the `instances` property.
   * @param {string} endpoint - the api endpoint.
   */
  static new = (chainId: ChainID) => {
    const endpoint = ChainList.get(chainId)?.endpoints.rpc;

    if (!endpoint) {
      throw new Error(
        `APIsController::new: Endpoint not found for chain ID ${chainId}`
      );
    }

    console.log('🤖 Creating new api interface: %o', endpoint);

    // Create API instance.
    const instance = new Api(endpoint, chainId);

    // Set remaining instance properties and add to instances.
    this.instances.push(instance);

    console.log(
      '🔧 New api disconnected instances: %o',
      this.instances.map((i) => i.chain)
    );
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
    }
  };

  /**
   * @name fetchConnectedInstance
   * @summary Returns the connected API instance for a specific chain ID.
   */
  static fetchConnectedInstance = async (chainId: ChainID) => {
    const instance = this.get(chainId);

    if (!instance) {
      throw new Error(`fetchConnectedInstance: API for ${chainId} not found`);
    }

    await instance.connect();

    this.set(instance);

    return instance;
  };

  static connectInstance = async (chainId: ChainID) => {
    const instance = this.get(chainId);
    if (!instance) {
      throw new Error(`connectInstance: API for ${chainId} not found`);
    }
    await instance?.connect();
    this.set(instance);
  };

  /**
   * @name get
   * @summary Gets an API instance from the `instances` property.
   * @param {ChainID} chain - the chain the instance belongs to.
   * @returns {(API|undefined)}
   */
  static get = (chain: ChainID): Api | undefined =>
    this.instances?.find((c) => c.chain === chain) || undefined;

  /**
   * @name set
   * @summary Updates an API instance in the `instances` property.
   * @param {API} instance - the API instance to set.
   */
  static set = (instance: Api) =>
    (this.instances =
      this.instances?.map((a) => (a.chain === instance.chain ? instance : a)) ||
      []);

  /**
   * @name getAllFlattenedAPIData
   * @summary Return an array of all flattened API data for all APIs managed by this class.
   */
  static getAllFlattenedAPIData = (): FlattenedAPIData[] =>
    this.instances.map((api) => api.flatten());
}
