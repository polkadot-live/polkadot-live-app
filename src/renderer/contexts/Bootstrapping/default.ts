// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { BootstrappingInterface } from './types';

export const defaultBootstrappingContext: BootstrappingInterface = {
  appLoading: true,
  online: false,
  isAborting: false,
  isConnecting: false,
  dockToggled: true,
  silenceOsNotifications: false,
  setSilenceOsNotifications: (b) => {},
  handleToggleSilenceOsNotifications: () => {},
  handleDockedToggle: () => {},
  setAppLoading: (b) => {},
  setIsAborting: (b) => {},
  setIsConnecting: (b) => {},
  setOnline: (b) => {},
  handleInitializeApp: () => new Promise(() => {}),
  handleInitializeAppOffline: () => new Promise(() => {}),
  handleInitializeAppOnline: () => new Promise(() => {}),
  handleNewEndpointForChain: (c, e) => new Promise(() => {}),
};
