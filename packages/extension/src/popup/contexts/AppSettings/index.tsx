// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
    const value = !cacheGet(key);
    const map = new Map(cacheRef.current).set(key, value);
    const data = { type: 'db', task: 'settings:set', key, value };
    setStateWithRef(map, setCache, cacheRef);
    chrome.runtime.sendMessage(data).then(() => 'toggled succesfully');
  };

  /**
   * Sync settings cache with database on mount.
   */
  useEffect(() => {
    const sync = async () => {
      const data = { type: 'db', task: 'settings:getAll' };
      const ser: string = await chrome.runtime.sendMessage(data);
      const array: [SettingKey, boolean][] = JSON.parse(ser);
      const map = new Map<SettingKey, boolean>(array);
      setStateWithRef(map, setCache, cacheRef);
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
