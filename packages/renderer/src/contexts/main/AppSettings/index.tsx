// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { defaultAppSettingsContext } from './defaults';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import type { AppSettingsContextInterface } from './types';
import type { SettingKey } from '@polkadot-live/types/settings';

export const AppSettingsContext = createContext<AppSettingsContextInterface>(
  defaultAppSettingsContext
);

export const useAppSettings = () => useContext(AppSettingsContext);

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
    cacheRef.current.get(key) || false;

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

    // TMP: Update config.
    updateConfig(key, val);

    // Update cache and store in main process.
    window.myAPI.sendSettingTask({
      action: 'settings:handle',
      data: { key, val },
    });
  };

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
   * TMP - Make config point to actual cache map.
   */
  const updateConfig = (key: SettingKey, val: boolean) => {
    switch (key) {
      case 'setting:silence-os-notifications': {
        ConfigRenderer.silenceNotifications = val;
        break;
      }
      case 'setting:show-debugging-subscriptions': {
        ConfigRenderer.showDebuggingSubscriptions = val;
        break;
      }
      case 'setting:automatic-subscriptions': {
        ConfigRenderer.enableAutomaticSubscriptions = val;
        break;
      }
      case 'setting:keep-outdated-events': {
        ConfigRenderer.keepOutdatedEvents = val;
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
      const ser = await window.myAPI.getAppSettings();
      const array: [SettingKey, boolean][] = JSON.parse(ser);
      const map = new Map<SettingKey, boolean>(array);
      setStateWithRef(map, setCache, cacheRef);

      // TODO: Make config point to the actual cache.
      // Set cached notifications flag in renderer config.
      ConfigRenderer.silenceNotifications = cacheGet(
        'setting:silence-os-notifications'
      );
      ConfigRenderer.showDebuggingSubscriptions = cacheGet(
        'setting:show-debugging-subscriptions'
      );
      ConfigRenderer.enableAutomaticSubscriptions = cacheGet(
        'setting:automatic-subscriptions'
      );
      ConfigRenderer.keepOutdatedEvents = cacheGet(
        'setting:keep-outdated-events'
      );
    };

    sync();
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        cacheGet,
        toggleSetting,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
