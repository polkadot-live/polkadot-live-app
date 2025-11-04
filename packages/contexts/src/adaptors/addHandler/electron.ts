// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import type { AddHandlerAdaptor } from './types';

export const electronAdapter: AddHandlerAdaptor = {
  postToMain: (encodedAccount, genericAccount) => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:import',
      data: {
        serEncodedAccount: JSON.stringify(encodedAccount),
        serGenericAccount: JSON.stringify(genericAccount),
      },
    });
  },

  updateAddressInStore: async (account) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:update',
      data: { serialized: JSON.stringify(account) },
    });
  },
};
