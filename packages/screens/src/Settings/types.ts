// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItemKey, SyncID } from '@polkadot-live/types';
import type { OsPlatform, SettingItem } from '@polkadot-live/types/settings';

export interface SettingsProps {
  platform: OsPlatform | null;
  connectionsCtx: {
    cacheGet: (key: SyncID) => boolean;
  };
  helpCtx: {
    openHelp: (key: HelpItemKey) => void;
  };
  settingsFlagsCtx: {
    getSwitchState: (setting: SettingItem) => boolean;
    handleSwitchToggle: (setting: SettingItem) => void;
    handleSetting: (setting: SettingItem) => void;
    handleAnalytics?: (setting: SettingItem) => void;
  };
}

export interface SettingProps {
  setting: SettingItem;
  connectionsCtx: {
    cacheGet: (key: SyncID) => boolean;
  };
  helpCtx: {
    openHelp: (key: HelpItemKey) => void;
  };
  settingsFlagsCtx: {
    getSwitchState: (setting: SettingItem) => boolean;
    handleSwitchToggle: (setting: SettingItem) => void;
    handleSetting: (setting: SettingItem) => void;
    handleAnalytics?: (setting: SettingItem) => void;
  };
}
