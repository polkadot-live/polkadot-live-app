// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useState } from 'react';
import * as defaults from './defaults';
import { ChainInstance, ChainsContextInterface } from './types';
import { ChainStatus } from '@polkadot-live/types/chains';

export const ChainsContext = createContext<ChainsContextInterface>(
  defaults.defaultChainsContext
);

export const useChains = () => useContext(ChainsContext);

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  // Store the currently active chains
  const [chains, setChains] = useState<ChainInstance[]>([]);

  // Adds a chain instance.
  const addChain = (name: string, status: ChainStatus) => {
    setChains([
      ...chains,
      {
        name,
        status,
      },
    ]);
  };

  // Removes a chain instance.
  const removeChain = (name: string) => {
    setChains(chains.filter((c) => c.name !== name));
  };

  // Gets a chain
  const getChain = (name: string) => {
    return chains.find((c) => c.name === name);
  };

  // Updates an existing chain.
  const setChain = (chain: ChainInstance) => {
    setChains(chains.map((c) => (c.name === chain.name ? chain : c)));
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
