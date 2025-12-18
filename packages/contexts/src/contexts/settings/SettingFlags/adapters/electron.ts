// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import type { SettingFlagsAdapter } from './types';
import type { SettingKey } from '@polkadot-live/types/settings';

export const electronAdapter: SettingFlagsAdapter = {
  syncOnMount: async (): Promise<Map<SettingKey, boolean>> =>
    await window.myAPI.getAppSettings(),

  handleAnalytics: (setting) => {
    switch (setting.key) {
      case 'setting:export-data': {
        window.myAPI.umamiEvent('backup-export', null);
        break;
      }
      case 'setting:import-data': {
        window.myAPI.umamiEvent('backup-import', null);
        break;
      }
    }
  },

  handleSetting: (setting) => {
    ConfigTabs.portToMain.postMessage({
      task: 'setting:execute',
      data: { setting },
    });
  },

  postSwitchToggle: (setting, value) => {
    const { key } = setting;
    const umamiData = { settingId: '', toggledOn: value };

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
  },
};
