// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { LATEST_VERSION_URL } from '@polkadot-live/consts/sharedState';
import { setStateWithRef } from '@w3ux/utils';
import { createContext, useEffect, useRef, useState } from 'react';
import { version as curVersion } from '../../../../../../package.json';
import { createSafeContextHook, renderToast } from '../../../utils';
import { getAppSettingsAdapter } from './adapters';
import { fetchLatestVersion, isNewer } from './releaseChecker';
import type { LatestVersionCache, SettingKey } from '@polkadot-live/types';
import type { AppSettingsContextInterface } from '../../../types/main';

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

  const [newRelease, setNewRelease] = useState<LatestVersionCache | null>(null);
  const newReleaseRef = useRef(newRelease);
  const isFetchingRef = useRef(false);
  const lastForcedRef = useRef<number | null>(null);
  const FORCE_LIMIT = 10 * 60 * 1000; // 10 minutes

  // Get value from cache.
  const cacheGet = (key: SettingKey): boolean =>
    Boolean(cacheRef.current.get(key));

  // Update settings cache and database.
  const toggleSetting = (key: SettingKey) => {
    adapter.onSettingToggle(key, setCache, cacheRef);
  };

  // Fetch version cache from database.
  const initLatest = async () => {
    const latest = await getLatest();
    if (latest) {
      setStateWithRef(latest, setNewRelease, newReleaseRef);
      if (latest.lastForcedAt) {
        lastForcedRef.current = latest.lastForcedAt;
      }
    }
  };

  const updateAvailable = (): boolean =>
    newRelease ? isNewer(curVersion, newRelease.version) : false;

  // Fetch latest version and update state.
  const fetchLatest = async (force = false) => {
    // Prevent concurrent fetches.
    if (isFetchingRef.current) return;

    // Client-side cooldown for forced/manual checks.
    if (force) {
      const last = lastForcedRef.current || 0;
      if (Date.now() - last < FORCE_LIMIT) {
        return;
      }
    }

    isFetchingRef.current = true;
    try {
      const url = LATEST_VERSION_URL;
      const res = await fetchLatestVersion(url, getLatest, setLatest, force);

      // Update last forced timestamp.
      if (force && res?.lastForcedAt) {
        lastForcedRef.current = res.lastForcedAt;
      }

      // Update state.
      const hasUpdate = Boolean(res && isNewer(curVersion, res.version));
      setStateWithRef(res, setNewRelease, newReleaseRef);
      const toastMsg = hasUpdate ? 'Update available' : 'Up to date';

      // Toast message.
      if (force) {
        renderToast(toastMsg, 'check-update', 'success', 'top-center');
      }
    } finally {
      isFetchingRef.current = false;
    }
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
    initLatest().then(() => fetchLatest());
  }, []);

  return (
    <AppSettingsContext
      value={{
        newReleaseRef,
        cacheGet,
        fetchLatest,
        toggleSetting,
        updateAvailable,
      }}
    >
      {children}
    </AppSettingsContext>
  );
};
