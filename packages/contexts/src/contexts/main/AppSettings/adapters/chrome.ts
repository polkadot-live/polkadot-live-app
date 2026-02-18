// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import type { SettingKey } from '@polkadot-live/types';
import type { AppSettingsAdapter } from './types';

export const chromeAdapter: AppSettingsAdapter = {
  onMount: async () => {
    const data = { type: 'db', task: 'settings:getAll' };
    const ser: string = await chrome.runtime.sendMessage(data);
    const array: [SettingKey, boolean][] = JSON.parse(ser);
    const map = new Map<SettingKey, boolean>(array);
    return map;
  },

  onSettingToggle: (key, setCache, cacheRef) => {
    const value = !cacheRef.current.get(key);
    const map = new Map(cacheRef.current).set(key, value);
    const data = { type: 'db', task: 'settings:set', key, value };
    setStateWithRef(map, setCache, cacheRef);
    chrome.runtime.sendMessage(data);
  },
};
