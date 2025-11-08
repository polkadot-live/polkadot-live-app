// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkassemblyAdapter } from './types';
import type { SettingKey } from '@polkadot-live/types';

export const chromeAdapter: PolkassemblyAdapter = {
  fetchSetting: async () =>
    (await chrome.runtime.sendMessage({
      type: 'db',
      task: 'settings:get',
      store: 'settings',
      key: 'setting:enable-polkassembly' as SettingKey,
    })) as boolean,
};
