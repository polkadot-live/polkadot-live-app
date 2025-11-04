// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import type { RemoveHandlerAdaptor } from './types';

export const electronAdapter: RemoveHandlerAdaptor = {
  updateAddressInStore: async (account) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:update',
      data: { serialized: JSON.stringify(account) },
    });
  },

  postToMain: (address, chainId) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:remove',
      data: { address, chainId },
    });
  },
};
