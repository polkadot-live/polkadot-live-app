// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import { setStateWithRef } from '@w3ux/utils';
import type { AppSettingsAdaptor } from './types';

export const electronAdapter: AppSettingsAdaptor = {
  onMount: async () => {
    const map = await window.myAPI.getAppSettings();
    ConfigRenderer.setAppSettings(map);
    return map;
  },

  onSettingToggle: (key, setCache, cacheRef) => {
    // Sync settings view.
    switch (key) {
      case 'setting:docked-window': {
        ConfigRenderer.portToSettings?.postMessage({
          task: 'settings:set:dockedWindow',
          data: { docked: !cacheRef.current.get(key) },
        });
        break;
      }
      case 'setting:silence-os-notifications': {
        ConfigRenderer.portToSettings?.postMessage({
          task: 'settings:set:silenceOsNotifications',
          data: { silenced: !cacheRef.current.get(key) },
        });
        break;
      }
    }
    // Set new setting value.
    const cur = cacheRef.current.get(key);
    const val = !cur;
    const map = new Map(cacheRef.current).set(key, val);
    setStateWithRef(map, setCache, cacheRef);

    // Update settings cache in config.
    ConfigRenderer.setAppSettings(map);

    // Update cache and store in main process.
    window.myAPI.sendSettingTask({
      action: 'settings:handle',
      data: { key, val },
    });
  },
};
