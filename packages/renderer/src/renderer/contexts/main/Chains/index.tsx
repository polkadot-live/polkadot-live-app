// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as defaults from './defaults';
import { APIsController } from '@ren/controller/APIsController';
import type { ChainsContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

export const ChainsContext = createContext<ChainsContextInterface>(
  defaults.defaultChainsContext
);

export const useChains = () => useContext(ChainsContext);

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  const [uiTrigger, setUiTrigger] = useState(false);
  const [chains, setChains] = useState<Map<ChainID, FlattenedAPIData>>(
    new Map()
  );

  // Trigger a render after chain data is set.
  useEffect(() => {
    if (uiTrigger) {
      setUiTrigger(false);
    }
  }, [uiTrigger]);

  // Adds a chain instance.
  const addChain = (apiData: FlattenedAPIData) => {
    setChains((prev) => prev.set(apiData.chainId, apiData));
  };

  // Cache chain state setter in controler for updaing UI.
  useEffect(() => {
    APIsController.cachedSetChains = setChains;
    APIsController.setUiTrigger = setUiTrigger;
  }, []);

  return (
    <ChainsContext.Provider
      value={{
        chains,
        addChain,
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
};
