// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { APIsController } from '@polkadot-live/core';
import { ChainList } from '@polkadot-live/consts/chains';
import type { ChainsContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

export const ChainsContext = createContext<ChainsContextInterface>(
  defaults.defaultChainsContext
);

export const useChains = () => useContext(ChainsContext);

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  const [uiTrigger, setUiTrigger] = useState(false);

  /**
   * Chains connected with Dedot.
   */
  const [chains, setChains] = useState<Map<ChainID, FlattenedAPIData>>(
    new Map()
  );

  const base = new Map<ChainID, boolean>(
    Array.from(ChainList.keys()).map((c) => [c, false])
  );

  const [workingConnects, setWorkingConnects] = useState(new Map(base));
  const [workingDisconnects, setWorkingDisconnects] = useState(new Map(base));
  const [workingEndpoints, setWorkingEndpoints] = useState(new Map(base));

  // Return true if any work is happening for the given chain.
  const isWorking = (chainId: ChainID): boolean =>
    Boolean(workingConnects.get(chainId)) ||
    Boolean(workingDisconnects.get(chainId)) ||
    Boolean(workingEndpoints.get(chainId));

  // Show spinner if any work is happening.
  const showWorkingSpinner = () => {
    const hasSome = (m: typeof base) =>
      Array.from(m.values()).some((v) => v === true);

    return (
      hasSome(workingConnects) ||
      hasSome(workingEndpoints) ||
      hasSome(workingDisconnects)
    );
  };

  // Handle clicking the api connect button.
  const onConnectClick = async (chainId: ChainID) => {
    setWorkingConnects((pv) => new Map(pv).set(chainId, true));
    await APIsController.connectApi(chainId);
    setWorkingConnects((pv) => new Map(pv).set(chainId, false));
  };

  // Handle clicking the api disconnect button.
  const onDisconnectClick = async (chainId: ChainID) => {
    setWorkingDisconnects((pv) => new Map(pv).set(chainId, true));
    await APIsController.close(chainId);
    setWorkingDisconnects((pv) => new Map(pv).set(chainId, false));
  };

  // Set chain endooint working flags.
  const setWorkingEndpoint = (chainId: ChainID, val: boolean) => {
    setWorkingEndpoints((pv) => new Map(pv).set(chainId, val));
  };

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
  }, []);

  return (
    <ChainsContext.Provider
      value={{
        chains,
        isWorking,
        onConnectClick,
        onDisconnectClick,
        setWorkingEndpoint,
        showWorkingSpinner,
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
};
