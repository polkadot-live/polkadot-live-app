// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import type { DeleteHandlerAdapter } from './types';

export const electronAdapter: DeleteHandlerAdapter = {
  removeFromStore: async (source, publicKeyHex) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:delete',
      data: { publicKeyHex, source },
    });
  },

  postToMain: (address, chainId) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:delete',
      data: { address, chainId },
    });
  },
};
