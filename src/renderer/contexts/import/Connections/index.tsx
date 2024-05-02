// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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
  // Connection flag set to `true` when app is in online mode.
  const [isConnected, setIsConnected] = useState(false);

  return (
    <ConnectionsContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </ConnectionsContext.Provider>
  );
};
