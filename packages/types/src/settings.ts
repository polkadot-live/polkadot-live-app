// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface PersistedSettings {
  appDocked: boolean;
  appDarkMode: boolean;
  appSilenceOsNotifications: boolean;
  appShowOnAllWorkspaces: boolean;
  appShowDebuggingSubscriptions: boolean;
  appEnableAutomaticSubscriptions: boolean;
  appEnablePolkassemblyApi: boolean;
  appKeepOutdatedEvents: boolean;
  appHideDockIcon: boolean;
  appCollapseSideNav: boolean;
}

export type OsPlatform = 'darwin' | 'linux' | 'win32';

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
  | 'settings:execute:collapseSideNav';
