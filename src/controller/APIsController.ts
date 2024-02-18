// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { API } from '@/model/API';
import { ChainList } from '@/config/chains';
import { MainDebug } from '@/utils/DebugUtils';
import { WindowsController } from './WindowsController';
import type { ChainID } from '@/types/chains';
import type { FlattenedAPIData } from '@/types/apis';

const debug = MainDebug.extend('APIs');

/**
 *  A static class that manages active api providers.
 * @class
 * @property {API} instances - a list of the active chain instances.
 */
export class APIsController {
  static instances: API[] = [];

  /**
   * @name initialize
   * @summary Instantiates a disconnected API instance for each supported chain.
   */
  static initialize = async (chainIds: ChainID[]) => {
    for (const chainId of chainIds) {
      await this.new(chainId);
    }
  };

  /**
   * @name chainExists
   * @summary Checks whether an API instace for the provided chain exists.
   * @param {ChainID} chain - the chain ID.
   * @deprecated
   */
  // TODO: Remove if not needed when multi-chain support is implemented.
  static chainExists = (chain: ChainID) =>
    !!APIsController.instances.find((a) => a.chain === chain);

  /**
   * @name new
   * @summary Instantiates a new disconnected API instance and adds it to the `instances` property.
   * @param {string} endpoint - the api endpoint.
   */
  static new = async (chainId: ChainID) => {
    const endpoint = ChainList.get(chainId)?.endpoints.rpc;

    if (!endpoint) {
      throw new Error(
        `APIsController::new: Endpoint not found for chain ID ${chainId}`
      );
    }

    debug('🤖 Instantiating new api: %o', endpoint);

    // Create API instance.
    const instance = new API(endpoint, chainId);

    // Set remaining instance properties and add to instances.
    this.instances.push(instance);

    debug(
      '🔧 New api disconnected instances: %o',
      this.instances.map((i) => i.chain)
    );
  };

  /**
   * @name close
   * @summary Disconnect from a chain.
   * @param {ChainID} chain - the chain identifier.
   */
  static close = async (chain: ChainID) => {
    const instance = this.instances.find((s) => s.chain === chain);

    if (instance) {
      console.log(`Disconnect chain API instance ${chain}`);
      await instance.disconnect();
      //this.instances = this.instances.filter((i) => i !== instance);
      //WindowsController.reportAll(chain, 'renderer:chain:removed');
      return;
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

  /**
   * @name get
   * @summary Gets an API instance from the `instances` property.
   * @param {ChainID} chain - the chain the instance belongs to.
   * @returns {(API|undefined)}
   */
  static get = (chain: ChainID): API | undefined =>
    this.instances?.find((c) => c.chain === chain) || undefined;

  /**
   * @name set
   * @summary Updates an API instance in the `instances` property.
   * @param {API} instance - the API instance to set.
   */
  static set = (instance: API) =>
    (this.instances =
      this.instances?.map((a) => (a.chain === instance.chain ? instance : a)) ||
      []);

  /**
   * @name reportAllConnections
   * @summary Report all active instances to all windows.
   */
  static reportAllConnections = () => {
    for (const { chain } of this.instances) {
      WindowsController.reportAll(chain, 'renderer:chain:sync');
    }
  };

  /**
   * @name getAllFlattenedAPIData
   * @summary Return an array of all flattened API data for all APIs managed by this class.
   */
  static getAllFlattenedAPIData = (): FlattenedAPIData[] =>
    this.instances.map((api) => api.flatten());
}
