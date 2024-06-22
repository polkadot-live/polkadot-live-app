// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ConnectionsContextInterface } from './types';

export const defaultConnectionsContext: ConnectionsContextInterface = {
  isConnected: false,
  setIsConnected: (b) => {},
};
