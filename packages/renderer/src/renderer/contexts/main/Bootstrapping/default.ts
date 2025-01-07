// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { BootstrappingInterface } from './types';

export const defaultBootstrappingContext: BootstrappingInterface = {
  appLoading: true,
  isAborting: false,
  isConnecting: false,
  setAppLoading: (b) => {},
  setIsAborting: (b) => {},
  setIsConnecting: (b) => {},
  handleInitializeApp: () => new Promise(() => {}),
  handleInitializeAppOffline: () => new Promise(() => {}),
  handleInitializeAppOnline: () => new Promise(() => {}),
  handleNewEndpointForChain: (c, e) => new Promise(() => {}),
  syncOpenGovWindow: () => new Promise(() => {}),
};
