// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkassemblyAdaptor } from './types';

export const electronAdapter: PolkassemblyAdaptor = {
  fetchSetting: async () => {
    const map = await window.myAPI.getAppSettings();
    return Boolean(map.get('setting:enable-polkassembly'));
  },
};
