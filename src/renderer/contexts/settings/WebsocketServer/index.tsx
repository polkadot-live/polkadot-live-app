// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { WebsocketServerContextInterface } from './types';

export const WebsocketServerContext =
  createContext<WebsocketServerContextInterface>(
    defaults.defaultWebsocketServerContext
  );

export const useWebsocketServer = () => useContext(WebsocketServerContext);

export const WebsocketServerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isListening, setIsListening] = useState(false);

  /// Post IPC message to main process to start listening.
  const startListening = async () => {
    // TODO: const result = await window.myAPI.startListening();
  };

  return (
    <WebsocketServerContext.Provider
      value={{ isListening, setIsListening, startListening }}
    >
      {children}
    </WebsocketServerContext.Provider>
  );
};
