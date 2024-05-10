// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingItem } from '@/renderer/screens/Settings/types';

export interface SettingFlagsContextInterface {
  getSwitchState: (setting: SettingItem) => boolean;
  handleSwitchToggle: (setting: SettingItem) => void;
  setWindowDocked: (flag: boolean) => void;
  setSilenceOsNotifications: (flag: boolean) => void;
}