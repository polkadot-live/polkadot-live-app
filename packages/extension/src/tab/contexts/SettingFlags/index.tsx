// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import type { SettingFlagsContextInterface } from './types';
import type { SettingKey, SettingItem } from '@polkadot-live/types/settings';

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
    const value = !cacheGet(key);
    const map = new Map(cacheRef.current).set(key, value);
    setStateWithRef(map, setCache, cacheRef);

    const msg = { type: 'db', task: 'settings:set', key, value };
    chrome.runtime.sendMessage(msg);
  };

  /**
   * Handle a setting action.
   * @todo Handle setting:show-debugging-subscriptions
   */
  const handleSetting = (setting: SettingItem) => {
    console.log(setting);
  };

  /**
   * Sync settings with main process on mount.
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
    <SettingFlagsContext
      value={{
        cacheSet,
        getSwitchState,
        handleSwitchToggle,
        handleSetting,
      }}
    >
      {children}
    </SettingFlagsContext>
  );
};
