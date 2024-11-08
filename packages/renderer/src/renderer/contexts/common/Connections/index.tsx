// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ConnectionsContextInterface } from './types';

/**
 * Automatically listens for and sets mode flag state when they are
 * updated in other processes.
 *
 * Immediately sets this renderer's mode flag state which is
 * consistent with the app.
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
  // Flag set to `true` when app is in online mode.
  const [isConnected, setIsConnected] = useState(false);

  // Flag set to `true` when app is importing data from backup file.
  const [isImporting, setIsImporting] = useState(false);

  // Flag set to `true` when app's theme is dark mode.
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Synchronize flags in store.
    const syncModeFlags = async () => {
      setIsImporting(await window.myAPI.getModeFlag('isImporting'));
      setDarkMode((await window.myAPI.getAppSettings()).appDarkMode);
    };

    // Listen for synching events.
    window.myAPI.syncModeFlags((_, { modeId, flag }) => {
      switch (modeId) {
        case 'isImporting': {
          setIsImporting(flag);
          break;
        }
        case 'darkMode': {
          setDarkMode(flag);
          break;
        }
        default: {
          break;
        }
      }
    });

    syncModeFlags();
  }, []);

  return (
    <ConnectionsContext.Provider
      value={{
        darkMode,
        isConnected,
        isImporting,
        setDarkMode,
        setIsConnected,
        setIsImporting,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
};
