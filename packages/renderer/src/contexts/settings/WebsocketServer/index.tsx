// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
  const startServer = async () => {
    const result = await window.myAPI.sendWebsocketTask({
      action: 'websockets:server:start',
      data: null,
    });
    console.log(`Websocket start response: ${result}`);
    setIsListening(result);
  };

  /// Post IPC message to main process to stop listening.
  const stopServer = async () => {
    const result = await window.myAPI.sendWebsocketTask({
      action: 'websockets:server:stop',
      data: null,
    });
    console.log(`Websocket stop response: ${result}`);
    result && setIsListening(false);
  };

  return (
    <WebsocketServerContext.Provider
      value={{ isListening, setIsListening, startServer, stopServer }}
    >
      {children}
    </WebsocketServerContext.Provider>
  );
};
