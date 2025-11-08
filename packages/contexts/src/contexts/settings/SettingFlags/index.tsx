// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import { useConnections } from '../../common';
import { getSettingFlagsAdapter } from './adapters';
import type { SettingKey, SettingItem } from '@polkadot-live/types/settings';
import type { SettingFlagsContextInterface } from '../../../types/settings';

export const SettingFlagsContext = createContext<
  SettingFlagsContextInterface | undefined
>(undefined);

export const useSettingFlags = createSafeContextHook(
  SettingFlagsContext,
  'SettingFlagsContext'
);

export const SettingFlagsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getSettingFlagsAdapter();
  const { relayState, getOnlineMode } = useConnections();
  const [cache, setCache] = useState(getDefaultSettings());
  const cacheRef = useRef(cache);

  /**
   * Get value from cache.
   */
  const cacheGet = (key: SettingKey): boolean =>
    Boolean(cacheRef.current.get(key));

  /**
   * Set value in cache.
   */
  const cacheSet = (key: SettingKey, val: boolean) => {
    const map = new Map(cacheRef.current).set(key, val);
    setStateWithRef(map, setCache, cacheRef);
  };

  /**
   * Determine if a swtich is on or off.
   */
  const getSwitchState = (setting: SettingItem) => {
    const { key } = setting;
    return cacheGet(key);
  };

  /**
   * Handle analytics.
   */
  const handleAnalytics = (setting: SettingItem) => {
    adapter.handleAnalytics(setting);
  };

  /**
   * Handle toggling a setting switch.
   */
  const handleSwitchToggle = (setting: SettingItem) => {
    const { key } = setting;
    const value = !cacheGet(key);
    const map = new Map(cacheRef.current).set(key, value);
    setStateWithRef(map, setCache, cacheRef);

    adapter.postSwitchToggle(setting, value);
  };

  /**
   * Handle a setting action.
   */
  const handleSetting = (setting: SettingItem) => {
    const isOnline = getOnlineMode();
    adapter.handleSetting(setting, isOnline, relayState);
  };

  /**
   * Sync settings with main process on mount.
   */
  useEffect(() => {
    const sync = async () => {
      const map = await adapter.syncOnMount();
      setStateWithRef(map, setCache, cacheRef);
    };
    sync();
  }, []);

  return (
    <SettingFlagsContext
      value={{
        cacheSet,
        getSwitchState,
        handleAnalytics,
        handleSwitchToggle,
        handleSetting,
      }}
    >
      {children}
    </SettingFlagsContext>
  );
};
