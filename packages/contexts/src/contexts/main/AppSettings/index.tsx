// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import { createContext, useEffect, useRef, useState } from 'react';
import { version as curVersion } from '../../../../../../package.json';
import { createSafeContextHook } from '../../../utils';
import { getAppSettingsAdapter } from './adapters';
import { fetchLatestVersion, isNewer } from './releaseChecker';
import type { SettingKey } from '@polkadot-live/types/settings';
import type { AppSettingsContextInterface } from '../../../types/main';
import type { LatestVersionCache } from './releaseChecker';

export const AppSettingsContext = createContext<
  AppSettingsContextInterface | undefined
>(undefined);

export const useAppSettings = createSafeContextHook(
  AppSettingsContext,
  'AppSettingsContext',
);

export const AppSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getAppSettingsAdapter();
  const [cache, setCache] = useState(getDefaultSettings());
  const cacheRef = useRef(cache);

  const [newRelease, setNewRelease] = useState(false);

  // Get value from cache.
  const cacheGet = (key: SettingKey): boolean =>
    Boolean(cacheRef.current.get(key));

  // Update settings cache and database.
  const toggleSetting = (key: SettingKey) => {
    adapter.onSettingToggle(key, setCache, cacheRef);
  };

  // Get cached latest release.
  const getLatest = async (): Promise<LatestVersionCache | null> => {
    const ser = await adapter.getLatestRelease();
    try {
      return ser === null ? ser : JSON.parse(ser);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Set cached latest release.
  const setLatest = async (cached: LatestVersionCache) => {
    adapter.setLatestRelease(JSON.stringify(cached));
  };

  // Sync settings cache with database.
  useEffect(() => {
    const sync = async () => {
      const map = await adapter.onMount();
      setStateWithRef(map, setCache, cacheRef);
    };
    sync();
  }, []);

  // Set new release flag.
  useEffect(() => {
    const fetchLatest = async () => {
      const URL = 'TODO'; // TODO: Set URL.
      const res = await fetchLatestVersion(URL, getLatest, setLatest);
      setNewRelease(res === null ? false : isNewer(curVersion, res.version));
    };
    fetchLatest();
  }, []);

  return (
    <AppSettingsContext
      value={{
        newRelease,
        cacheGet,
        toggleSetting,
      }}
    >
      {children}
    </AppSettingsContext>
  );
};
