// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import type { ImportHandlerAdapter } from './types';

export const electronAdapter: ImportHandlerAdapter = {
  persist: async (genericAccount) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:persist',
      data: { serialized: JSON.stringify(genericAccount) },
    });
  },

  postToMain: (genericAccount, encodedAccount) => {
    ConfigTabs.portToMain.postMessage({
      task: 'renderer:address:import',
      data: {
        serEncodedAccount: JSON.stringify(genericAccount),
        serGenericAccount: JSON.stringify(encodedAccount),
      },
    });
  },
};
