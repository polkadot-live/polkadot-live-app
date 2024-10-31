// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ConnectionsContextInterface } from './types';

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
