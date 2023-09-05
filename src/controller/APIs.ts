// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { store } from '@/main';
import { ChainList } from '@/config/chains';
import { API } from '@/model/API';
import { Accounts } from './Accounts';
import { Discover } from './Discover';
import { Windows } from './Windows';
import { ChainID } from '@polkadot-live/types/chains';
import { MainDebug } from '@/debugging';
import { AnyData } from '@polkadot-live/types';

const debug = MainDebug.extend('APIs');

/**
 *  A static class that manages active api providers.
 * @class
 * @property {ImportedAccounts} instances - a list of the active chain instances.
 */
export class APIs {
  static instances: API[] = [];

  /**
   * @name initialize
   * @summary Instantiates and stores API Instances from persisted imported accounts.
   */
  static initialize = async () => {
    // Instantiate API Instances from stored imported accounts.
    const instances =
      (Object.keys(store.get('imported_accounts') || {}) as ChainID[])?.filter(
        (c) => Object.keys(ChainList).includes(c)
      ) || [];

    for (const i of instances) {
      await this.new((ChainList[i] as AnyData).endpoints?.rpc);
    }
  };

  /**
   * @name chainExists
   * @summary Checks whether an API instace for the provided chain exists.
   * @param {ChainID} chain - the chain ID.
   */
  static chainExists = (chain: ChainID) => {
    return !!APIs.instances.find((a) => a.chain === chain);
  };

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
      !Object.keys(ChainList).includes(chain) ||
      this.instances.find((s) => s.chain === chain)
    ) {
      await instance.disconnect();
      return;
    }

    // We now know `chain` is a supported ChainID.
    const chainId = chain as ChainID;

    // Set remaining instance properties and add to instances.
    this.instances = this.instances.concat(instance);

    // Set the api and bootstrap chain.
    instance.setApi(api, chainId);

    // Get api constants.
    await instance.getConsts();

    // Bootstrap events for connected accounts.
    Discover.bootstrapEvents(chainId);

    // Report to app that chain has been added.
    Windows.reportAll(chainId, 'chainAdded');

    // Subscribe to existing chain accounts state.
    Accounts.accounts[chain]?.forEach((account) => {
      account.state.subscribe();
    });

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
      Windows.reportAll(chain, 'chainRemoved');
      return;
    }
  };

  /**
   * @name get
   * @summary Gets an account from the `accounts` property.
   * @param {ChainID} chain - the chain the account belongs to.
   * @returns {(API|undefined)}
   */
  static get = (chain: ChainID): API | undefined => {
    return this.instances?.find((c) => c.chain === chain) || undefined;
  };

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
   * @summary Report all active instances to the app.
   */
  static reportAllConnections = () => {
    for (const { chain } of this.instances) {
      Windows.reportAll(chain, 'syncChain');
    }
  };
}
