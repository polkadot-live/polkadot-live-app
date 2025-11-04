// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import type { ReferendaAdaptor } from './types';

export const electronAdapter: ReferendaAdaptor = {
  requestReferenda: async (chainId) => {
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId },
    });
    return null;
  },

  getPolkassemblyFlag: async () => {
    const map = await window.myAPI.getAppSettings();
    return Boolean(map.get('setting:enable-polkassembly'));
  },
};
