// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useState } from 'react';
import * as defaults from './defaults';
import type { ChainsContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

export const ChainsContext = createContext<ChainsContextInterface>(
  defaults.defaultChainsContext
);

export const useChains = () => useContext(ChainsContext);

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  // Store the currently active chains
  const [chains, setChains] = useState<Map<ChainID, FlattenedAPIData>>(
    new Map()
  );

  // Adds a chain instance.
  const addChain = (apiData: FlattenedAPIData) => {
    setChains((prev) => {
      prev.set(apiData.chainId, apiData);
      return prev;
    });
  };

  // Removes a chain instance.
  const removeChain = (chain: ChainID) => {
    //setChains(chains.filter((c) => c.chainId !== chain));
    console.log(chain);
  };

  // Gets a chain
  const getChain = (chain: ChainID) => chains.get(chain);

  // Updates an existing chain.
  const setChain = (data: FlattenedAPIData) => {
    setChains(chains.set(data.chainId, data));
  };

  return (
    <ChainsContext.Provider
      value={{
        chains,
        addChain,
        removeChain,
        getChain,
        setChain,
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
};
