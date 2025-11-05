// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getAppSettingsAdapter } from './adaptors';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import type { SettingKey } from '@polkadot-live/types/settings';
import type { AppSettingsContextInterface } from '../../../types/main';

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
  const adaptor = getAppSettingsAdapter();
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
    adaptor.onSettingToggle(key, setCache, cacheRef);
  };

  /**
   * Sync settings cache with database on mount.
   */
  useEffect(() => {
    const sync = async () => {
      const map = await adaptor.onMount();
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
