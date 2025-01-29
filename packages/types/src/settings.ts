// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItemKey } from './help';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export type OsPlatform = 'darwin' | 'linux' | 'win32';

export interface PersistedSettings {
  appDocked: boolean;
  appDarkMode: boolean;
  appSilenceOsNotifications: boolean;
  appSilenceExtrinsicsOsNotifications: boolean;
  appShowOnAllWorkspaces: boolean;
  appShowDebuggingSubscriptions: boolean;
  appEnableAutomaticSubscriptions: boolean;
  appEnablePolkassemblyApi: boolean;
  appKeepOutdatedEvents: boolean;
  appHideDockIcon: boolean;
  appCollapseSideNav: boolean;
}

export type SettingAction =
  | 'settings:execute:dockedWindow'
  | 'settings:execute:showOnAllWorkspaces'
  | 'settings:execute:silenceOsNotifications'
  | 'settings:execute:importData'
  | 'settings:execute:exportData'
  | 'settings:execute:showDebuggingSubscriptions'
  | 'settings:execute:enableAutomaticSubscriptions'
  | 'settings:execute:enablePolkassembly'
  | 'settings:execute:keepOutdatedEvents'
  | 'settings:execute:hideDockIcon'
  | 'settings:execute:collapseSideNav'
  | 'settings:execute:silenceExtrinsicsOsNotifications';

export interface SettingItem {
  action: SettingAction;
  category: string;
  title: string;
  enabled: boolean;
  helpKey: HelpItemKey;
  settingType: string;
  buttonText?: string;
  buttonIcon?: IconProp;
  platforms: OsPlatform[];
}
