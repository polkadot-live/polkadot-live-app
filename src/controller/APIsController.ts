// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ApiPromise } from '@polkadot/api';
import { ChainList } from '@/config/chains';
import { API } from '@/model/API';
import { WindowsController } from './WindowsController';
import type { ChainID } from '@/types/chains';
import { MainDebug } from '@/utils/DebugUtils';
import type { AnyData } from '@/types/misc';

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
   * @summary Instantiates and stores API Instances from persisted imported accounts.
   */
  static initialize = async (chainIds: ChainID[]) => {
    for (const chainId of chainIds) {
      console.log(`New API: ${chainId}`);
      await this.new((ChainList.get(chainId) as AnyData).endpoints?.rpc);
    }
  };

  /**
   * @name chainExists
   * @summary Checks whether an API instace for the provided chain exists.
   * @param {ChainID} chain - the chain ID.
   */
  static chainExists = (chain: ChainID) =>
    !!APIsController.instances.find((a) => a.chain === chain);

  /**
   * @name new
   * @summary Instantiates a new API instance and adds it to the `instances` property.
   * @param {string} endpoint - the api endpoint.
   */
  static new = async (endpoint: string) => {
    debug('🤖 Instantiating new api: %o', endpoint);

    // Create API instance.
    const instance = new API(endpoint);

    const api = await ApiPromise.create({ provider: instance.provider });

    const chain = (await api.rpc.system.chain()).toString();

    // Connection is cancelled if chain is not a supported chain, or if chain is already in service.
    if (
      !ChainList.get(chain as ChainID) ||
      this.instances.find(({ chain: instanceChain }) => instanceChain === chain)
    ) {
      await instance.disconnect();
      return;
    }

    // We now know `chain` is a supported ChainID.
    const chainId = chain as ChainID;

    // Set remaining instance properties and add to instances.
    this.instances.push(instance);

    // Set the api and bootstrap chain.
    instance.setApi(api, chainId);

    // Get api constants.
    await instance.getConsts();

    // Report to all windows that chain has been added.
    WindowsController.reportAll(chainId, 'renderer:chain:added');

    debug(
      '🔧 New api instances: %o',
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
      await instance.disconnect();
      this.instances = this.instances.filter((i) => i !== instance);
      WindowsController.reportAll(chain, 'renderer:chain:removed');
      return;
    }
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
}
