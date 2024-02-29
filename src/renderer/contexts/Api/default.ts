// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { APIsContextInterface } from './types';

export const defaultAPIsContext: APIsContextInterface = {
  instances: [],
  updateInstances: null,
  initializeAPIs: null,
  disconnectApi: null,
  fetchConnectedApi: null,
};
