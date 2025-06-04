// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import type { SettingFlagsContextInterface } from './types';
import type { SettingKey, SettingItem } from '@polkadot-live/types/settings';

export const SettingFlagsContext = createContext<SettingFlagsContextInterface>(
  defaults.defaultSettingFlagsContext
);

export const useSettingFlags = () => useContext(SettingFlagsContext);

export const SettingFlagsProvider = ({
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
   * Handle toggling a setting switch.
   */
  const handleSwitchToggle = (setting: SettingItem) => {
    const { key } = setting;
    const val = !cacheGet(key);
    const map = new Map(cacheRef.current).set(key, val);
    setStateWithRef(map, setCache, cacheRef);

    const umamiData = { settingId: '', toggledOn: val };

    switch (key) {
      case 'setting:docked-window':
        umamiData.settingId = 'dock-window';
        break;
      case 'setting:silence-os-notifications':
        umamiData.settingId = 'silence-notifications';
        break;
      case 'setting:silence-extrinsic-notifications':
        umamiData.settingId = 'silence-extrinsics-notifications';
        break;
      case 'setting:show-all-workspaces':
        umamiData.settingId = 'all-workspaces';
        break;
      case 'setting:show-debugging-subscriptions':
        umamiData.settingId = 'debugging-subscriptions';
        break;
      case 'setting:automatic-subscriptions':
        umamiData.settingId = 'automatic-subscriptions';
        break;
      case 'setting:enable-polkassembly':
        umamiData.settingId = 'polkassembly-api';
        break;
      case 'setting:keep-outdated-events':
        umamiData.settingId = 'outdated-events';
        break;
      case 'setting:hide-dock-icon':
        umamiData.settingId = 'hide-dock-icon';
        break;
    }

    const { settingId, toggledOn } = umamiData;
    const event = `setting-toggle-${toggledOn ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { setting: settingId });
  };

  /**
   * Sync settings with main process on mount.
   */
  useEffect(() => {
    const sync = async () => {
      const map = await window.myAPI.getAppSettings();
      setStateWithRef(map, setCache, cacheRef);
    };

    sync();
  }, []);

  return (
    <SettingFlagsContext.Provider
      value={{
        cacheSet,
        getSwitchState,
        handleSwitchToggle,
      }}
    >
      {children}
    </SettingFlagsContext.Provider>
  );
};
