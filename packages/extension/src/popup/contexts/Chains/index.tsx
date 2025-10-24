// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { ChainList } from '@polkadot-live/consts/chains';
import { useApiHealth } from '../ApiHealth';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainsContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

export const ChainsContext = createContext<ChainsContextInterface | undefined>(
  undefined
);

export const useChains = createSafeContextHook(ChainsContext, 'ChainsContext');

export const ChainsProvider = ({ children }: { children: React.ReactNode }) => {
  const { startApi } = useApiHealth();
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

  /**
   * Return true if any work is happening for the given chain.
   */
  const isWorking = (chainId: ChainID): boolean =>
    Boolean(workingConnects.get(chainId)) ||
    Boolean(workingDisconnects.get(chainId)) ||
    Boolean(workingEndpoints.get(chainId));

  /**
   * Show spinner if any work is happening.
   */
  const showWorkingSpinner = () => {
    const hasSome = (m: typeof base) =>
      Array.from(m.values()).some((v) => v === true);

    return (
      hasSome(workingConnects) ||
      hasSome(workingEndpoints) ||
      hasSome(workingDisconnects)
    );
  };

  /**
   * Handle clicking the api connect button.
   */
  const onConnectClick = async (chainId: ChainID) => {
    setWorkingConnects((pv) => new Map(pv).set(chainId, true));
    await startApi(chainId);
    setWorkingConnects((pv) => new Map(pv).set(chainId, false));
  };

  /**
   * Handle clicking the api disconnect button.
   */
  const onDisconnectClick = async (chainId: ChainID) => {
    setWorkingDisconnects((pv) => new Map(pv).set(chainId, true));
    const data = { type: 'api', task: 'closeApi', chainId };
    await chrome.runtime.sendMessage(data);
    setWorkingDisconnects((pv) => new Map(pv).set(chainId, false));
  };

  /**
   * Set chain endooint working flags.
   */
  const setWorkingEndpoint = (chainId: ChainID, val: boolean) => {
    setWorkingEndpoints((pv) => new Map(pv).set(chainId, val));
  };

  /**
   * Trigger a render after chain data is set.
   */
  useEffect(() => {
    if (uiTrigger) {
      setUiTrigger(false);
    }
  }, [uiTrigger]);

  /**
   * Listen for react state tasks from background worker.
   */
  useEffect(() => {
    const syncState = async () => {
      const data = { type: 'api', task: 'syncChainState' };
      chrome.runtime.sendMessage(data);
    };
    const callback = (message: AnyData) => {
      const { type, task } = message;
      if (type === 'api') {
        switch (task) {
          case 'state:chains':
          case 'state:onPopupReload': {
            const { ser }: { ser: string } = message.payload;
            const array: [ChainID, FlattenedAPIData][] = JSON.parse(ser);
            const map = new Map<ChainID, FlattenedAPIData>(array);
            setChains(map);
            setUiTrigger(true);
            break;
          }
          case 'state:chain': {
            const { ser }: { ser: string } = message.payload;
            const flattened: FlattenedAPIData = JSON.parse(ser);
            setChains((pv) => new Map(pv).set(flattened.chainId, flattened));
            setUiTrigger(true);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    syncState();
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  return (
    <ChainsContext
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
    </ChainsContext>
  );
};
