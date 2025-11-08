// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';
import type { SyncID } from '@polkadot-live/types/communication';

export interface SettingFlagsAdapter {
  handleAnalytics: (setting: SettingItem) => void;
  handleSetting: (
    setting: SettingItem,
    isOnline?: boolean,
    relayState?: (syncId: SyncID, state: boolean | string) => void
  ) => void;
  postSwitchToggle: (setting: SettingItem, value: boolean) => void;
  syncOnMount: () => Promise<Map<SettingKey, boolean>>;
}
