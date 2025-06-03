// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { setStateWithRef } from '@w3ux/utils';
import type { ConnectionsContextInterface } from './types';
import type { IpcRendererEvent } from 'electron';
import type { SyncID } from '@polkadot-live/types/communication';

/**
 * Automatically listens for and sets shared state when the state is
 * updated in other processes.
 *
 * Keeps state synchronized between processes.
 */

export const ConnectionsContext = createContext<ConnectionsContextInterface>(
  defaults.defaultConnectionsContext
);

export const useConnections = () => useContext(ConnectionsContext);

export const ConnectionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * Cache to control rendering logic only.
   */
  const [cache, setCache] = useState(initSharedState());
  const cacheRef = useRef(cache);

  /**
   * Flag set to `true` when app's theme is dark mode.
   */
  const [darkMode, setDarkMode] = useState(true);

  /**
   * Get a cached value.
   */
  const cacheGet = (key: SyncID): boolean => Boolean(cacheRef.current.get(key));

  /**
   * Return flag indicating whether app is in online or offline mode.
   */
  const getOnlineMode = () =>
    cacheGet('mode:connected') && cacheGet('mode:online');

  useEffect(() => {
    /**
     * Synchronize flags in store.
     */
    const sync = async () => {
      // TODO: Integrate into cache.
      const parsed = await window.myAPI.getAppSettings();
      setDarkMode(Boolean(parsed.get('setting:dark-mode')));

      // TODO: Optimise with one IPC.
      const map: typeof cache = new Map();
      for (const key of initSharedState().keys()) {
        const val = (await window.myAPI.getSharedState(key)) as boolean;
        map.set(key, val);
      }
      setStateWithRef(map, setCache, cacheRef);
    };

    /**
     * Listen for shared state syncing.
     */
    window.myAPI.syncSharedState(
      (
        _: IpcRendererEvent,
        { syncId, state }: { syncId: SyncID; state: string | boolean }
      ) => {
        switch (syncId) {
          case 'mode:dark': {
            setDarkMode(state as boolean);
            break;
          }
          default: {
            const map = new Map(cacheRef.current).set(syncId, state as boolean);
            setStateWithRef(map, setCache, cacheRef);
            break;
          }
        }
      }
    );

    sync();
  }, []);

  return (
    <ConnectionsContext.Provider
      value={{
        darkMode,
        cacheGet,
        getOnlineMode,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
};
