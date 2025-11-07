// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkassemblyAdapter } from './types';

export const electronAdapter: PolkassemblyAdapter = {
  fetchSetting: async () => {
    const map = await window.myAPI.getAppSettings();
    return Boolean(map.get('setting:enable-polkassembly'));
  },
};
