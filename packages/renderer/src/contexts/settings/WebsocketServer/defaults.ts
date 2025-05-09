// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { WebsocketServerContextInterface } from './types';

export const defaultWebsocketServerContext: WebsocketServerContextInterface = {
  isListening: false,
  setIsListening: () => {},
  startServer: () => new Promise(() => {}),
  stopServer: () => new Promise(() => {}),
};
