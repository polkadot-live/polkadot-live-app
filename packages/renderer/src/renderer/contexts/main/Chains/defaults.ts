// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ChainsContextInterface } from './types';

export const defaultChainsContext: ChainsContextInterface = {
  chains: new Map(),
  dedotChains: new Map(),
  isWorking: () => false,
  onConnectClick: () => new Promise(() => {}),
  onDisconnectClick: () => new Promise(() => {}),
  setWorkingEndpoint: () => {},
  showWorkingSpinner: () => false,
};
