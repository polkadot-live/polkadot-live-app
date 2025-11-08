// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingKey } from '@polkadot-live/types/settings';

export interface AppSettingsContextInterface {
  cacheGet: (key: SettingKey) => boolean;
  toggleSetting: (setting: SettingKey) => void;
}
