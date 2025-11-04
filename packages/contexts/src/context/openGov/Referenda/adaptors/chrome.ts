// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReferendaAdaptor } from './types';
import type { ReferendaInfo, SettingKey } from '@polkadot-live/types';

export const chromeAdapter: ReferendaAdaptor = {
  requestReferenda: async (chainId) => {
    const result = (await chrome.runtime.sendMessage({
      type: 'openGov',
      task: 'fetchReferenda',
      payload: { chainId },
    })) as ReferendaInfo[];
    return result;
  },

  getPolkassemblyFlag: async () =>
    (await chrome.runtime.sendMessage({
      type: 'db',
      task: 'settings:get',
      store: 'settings',
      key: 'setting:enable-polkassembly' as SettingKey,
    })) as boolean,
};
