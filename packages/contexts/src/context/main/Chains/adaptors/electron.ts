// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@polkadot-live/core';
import type { ChainsAdaptor } from './types';

export const electronAdapter: ChainsAdaptor = {
  listenOnMount: (setChains, setUiTrigger) => {
    APIsController.cachedSetChains = setChains;
    APIsController.setUiTrigger = setUiTrigger;
    return null;
  },

  onDisconnectApi: async (chainId) => {
    await APIsController.close(chainId);
  },

  onMount: () => {
    /* empty */
  },
};
