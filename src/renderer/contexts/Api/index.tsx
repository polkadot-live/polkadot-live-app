// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './default';
import { Api } from '@/renderer/model/Api';
import { ChainList } from '@/config/chains';
import { createContext, useContext, useState } from 'react';
import { MainDebug } from '@/utils/DebugUtils';
import type { APIsContextInterface } from './types';
import type { ChainID } from '@/types/chains';

const debug = MainDebug.extend('APIs');

export const APIsContext = createContext<APIsContextInterface>(
  defaults.defaultAPIsContext
);

export const useAPIs = () => useContext(APIsContext);

export const APIsProvider = ({ children }: { children: React.ReactNode }) => {
  const [instances, setInstances] = useState<Api[]>([]);

  /// Instantiate a disconnected `Api` for each chain ID and push to `instances` state.
  const initializeAPIs = async (chainIds: ChainID[]) => {
    for (const chainId of chainIds) {
      await createApi(chainId);
    }
  };

  /// Setter function for context consumers.
  const updateInstances = (updatedInstances: Api[]) => {
    setInstances(updatedInstances);
  };

  /// Disconnect from a chain.
  const disconnectApi = async (chain: ChainID) => {
    const instance = instances.find((s) => s.chain === chain);

    if (instance) {
      debug('🔷 Disconnect chain API instance %o.', chain);

      await instance.disconnect();

      setInstances((prevState) =>
        prevState.map((api) => (api.chain === instance.chain ? instance : api))
      );
    }
  };

  /// Returns the connected API instance for a specific chain ID.
  const fetchConnectedApi = async (chainId: ChainID): Promise<Api> => {
    const instance = getApi(chainId);

    if (!instance) {
      throw new Error(`fetchConnectedInstance: API for ${chainId} not found`);
    }

    await instance.connect();
    replaceApi(instance);

    return instance;
  };

  /// Instantiate a new disconnected Api instance and push to `instances` state.
  const createApi = async (chainId: ChainID) => {
    const endpoint = ChainList.get(chainId)?.endpoints.rpc;

    // Throw error if endpoint not supported.
    if (!endpoint) {
      throw new Error(
        `APIsController::new: Endpoint not found for chain ID ${chainId}`
      );
    }

    // Push new Api instance to state.
    setInstances((prevState) => {
      prevState.push(new Api(endpoint, chainId));
      return prevState;
    });
  };

  /// Gets an API instance from the `instances` property.
  const getApi = (chain: ChainID): Api | undefined =>
    instances.find((api) => api.chain === chain) || undefined;

  /// Updates an API instance in the `instances` state.
  const replaceApi = (instance: Api) => {
    setInstances((prevState) =>
      prevState.map((api) => (api.chain === instance.chain ? instance : api))
    );
  };

  /*
   * TODO: Re-implement these functions on the front-end.
   * Instead of sending an IPC message, update state on the renderer directly.
   *
   * static reportAllConnections = () => {
   *   for (const { chain } of this.instances) {
   *     WindowsController.reportAll(chain, 'renderer:chain:sync');
   *   }
   * };
   *
   * static getAllFlattenedAPIData = (): FlattenedAPIData[] =>
   *   this.instances.map((api) => api.flatten());
   */

  return (
    <APIsContext.Provider
      value={{
        instances,
        updateInstances,
        initializeAPIs,
        disconnectApi,
        fetchConnectedApi,
      }}
    >
      {children}
    </APIsContext.Provider>
  );
};
