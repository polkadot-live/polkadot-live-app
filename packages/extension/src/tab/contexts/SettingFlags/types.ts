// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';

export interface SettingFlagsContextInterface {
  cacheSet: (key: SettingKey, val: boolean) => void;
  getSwitchState: (setting: SettingItem) => boolean;
  handleSwitchToggle: (setting: SettingItem) => void;
  handleSetting: (setting: SettingItem) => void;
}
