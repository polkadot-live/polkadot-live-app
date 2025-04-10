// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as defaults from './defaults';
import { APIsController } from '@ren/controller/APIsController';
import { APIsController as DedotApisController } from '@ren/controller/dedot/APIsController';
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

  const [dedotChains, setDedotChains] = useState<
    Map<ChainID, FlattenedAPIData>
  >(new Map());

  // Trigger a render after chain data is set.
  useEffect(() => {
    if (uiTrigger) {
      setUiTrigger(false);
    }
  }, [uiTrigger]);

  // Cache chain state setter in controller for updaing UI.
  useEffect(() => {
    APIsController.cachedSetChains = setChains;
    APIsController.setUiTrigger = setUiTrigger;

    DedotApisController.cachedSetChains = setDedotChains;
    DedotApisController.setUiTrigger = setUiTrigger;
  }, []);

  return (
    <ChainsContext.Provider
      value={{
        chains,
        dedotChains,
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
};
