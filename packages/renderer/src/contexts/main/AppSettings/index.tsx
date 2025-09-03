// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import type { AppSettingsContextInterface } from './types';
import type { SettingKey } from '@polkadot-live/types/settings';

export const AppSettingsContext = createContext<
  AppSettingsContextInterface | undefined
>(undefined);

export const useAppSettings = createSafeContextHook(
  AppSettingsContext,
  'AppSettingsContext'
);

export const AppSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cache, setCache] = useState(getDefaultSettings());
  const cacheRef = useRef(cache);

  /**
   * Get value from cache.
   */
  const cacheGet = (key: SettingKey): boolean =>
    Boolean(cacheRef.current.get(key));

  /**
   * Update settings cache and send IPC to update settings in main process.
   */
  const toggleSetting = (key: SettingKey) => {
    syncSettingsView(key);

    // Set new setting value.
    const cur = cacheGet(key);
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
  };

  /**
   * Sync settings view with toggled value.
   */
  const syncSettingsView = (key: SettingKey) => {
    switch (key) {
      case 'setting:docked-window': {
        ConfigRenderer.portToSettings?.postMessage({
          task: 'settings:set:dockedWindow',
          data: { docked: !cacheGet(key) },
        });
        break;
      }
      case 'setting:silence-os-notifications': {
        ConfigRenderer.portToSettings?.postMessage({
          task: 'settings:set:silenceOsNotifications',
          data: { silenced: !cacheGet(key) },
        });
        break;
      }
    }
  };

  /**
   * Sync settings cache with main process on mount.
   */
  useEffect(() => {
    const sync = async () => {
      // Get settings from main process.
      const map = await window.myAPI.getAppSettings();
      setStateWithRef(map, setCache, cacheRef);

      // Make config point to the actual cache.
      ConfigRenderer.setAppSettings(map);
    };

    sync();
  }, []);

  return (
    <AppSettingsContext
      value={{
        cacheGet,
        toggleSetting,
      }}
    >
      {children}
    </AppSettingsContext>
  );
};
