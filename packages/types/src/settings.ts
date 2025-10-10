// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItemKey } from './help';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export type OsPlatform = 'chrome' | 'darwin' | 'linux' | 'win32';

export type SettingKey =
  | 'setting:automatic-subscriptions'
  | 'setting:collapse-side-nav'
  | 'setting:dark-mode'
  | 'setting:docked-window'
  | 'setting:enable-polkassembly'
  | 'setting:export-data'
  | 'setting:hide-dock-icon'
  | 'setting:import-data'
  | 'setting:keep-outdated-events'
  | 'setting:show-all-workspaces'
  | 'setting:show-debugging-subscriptions'
  | 'setting:silence-extrinsic-notifications'
  | 'setting:silence-os-notifications';

export interface SettingItem {
  category: string;
  title: string;
  enabled: boolean;
  helpKey: HelpItemKey;
  key: SettingKey;
  settingType: string;
  buttonText?: string;
  buttonIcon?: IconProp;
  platforms: OsPlatform[];
}
