// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ConnectionsContextInterface } from './types';
import type { IpcRendererEvent } from 'electron';
import type { SyncID } from '@polkadot-live/types/communication';
import type { PersistedSettings } from '@polkadot-live/types/settings';

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
   * Cache with default values.
   */
  const [cache, setCache] = useState(
    new Map<SyncID, boolean>(initSharedState())
  );

  /**
   * Get a cached value.
   */
  const cacheGet = (key: SyncID): boolean => cache.get(key) || false;

  // Flag set to `true` when app's theme is dark mode.
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    /**
     * Synchronize flags in store.
     */
    const syncSharedStateOnMount = async () => {
      // TODO: Integrate into cache.
      const settings: PersistedSettings = await window.myAPI.getAppSettings();
      setDarkMode(settings.appDarkMode);

      // TODO: Optimise with one IPC.
      for (const key of Array.from(cache.keys())) {
        const res = (await window.myAPI.getSharedState(key)) as boolean;
        setCache((pv) => new Map(pv).set(key, res));
      }
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
            setCache((pv) => new Map(pv).set(syncId, state as boolean));
            break;
          }
        }
      }
    );

    syncSharedStateOnMount();
  }, []);

  /**
   * Return flag indicating whether app is in online or offline mode.
   */
  const getOnlineMode = () =>
    cacheGet('mode:connected') && cacheGet('mode:online');

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
