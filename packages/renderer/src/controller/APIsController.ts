// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Api } from '@ren/model/Api';
import { ChainList } from '@ren/config/chains';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

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
   * @name setApiEndpoint
   * @summary Set the endpoint for an API instance.
   */
  static setApiEndpoint = (chainId: ChainID, newEndpoint: string) => {
    const instance = this.get(chainId);
    if (!instance) {
      throw new Error(`fetchConnectedInstance: API for ${chainId} not found`);
    }

    instance.endpoint = newEndpoint;
    this.set(instance);
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

    // Wait until the requested API instance is connected if it is currently connecting.
    if (instance.status === 'connecting') {
      console.log(`${chainId} is connecting. Entering while loop...`);

      // Lambda to wait for 1 second.
      const waitOneSecond = (): Promise<void> =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 1000);
        });

      // Enter loop to check for the connected instance every second.
      let secondsWaited = 0;
      while (instance.status === 'connecting') {
        await waitOneSecond();
        ++secondsWaited;

        // Re-fetch the API instance and check if it's now connected.
        const newInstance = this.get(chainId);
        if (newInstance?.status === 'connected' && newInstance.api !== null) {
          console.log(`${chainId} connected, waited ${secondsWaited} seconds.`);
          return newInstance;
        } else if (secondsWaited > ConfigRenderer.processingTimeout) {
          // If we have waited for more than 10 seconds, return null.
          const seconds = ConfigRenderer.processingTimeout;
          console.log(`Waited ${seconds} seconds to connect, return null.`);
          return null;
        }
      }
    } else {
      await instance.connect();
      this.set(instance);
      return instance;
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
