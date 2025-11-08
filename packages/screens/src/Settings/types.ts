// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OsPlatform, SettingItem } from '@polkadot-live/types/settings';

export interface SettingsProps {
  platform: OsPlatform | null;
}

export interface SettingProps {
  setting: SettingItem;
}
