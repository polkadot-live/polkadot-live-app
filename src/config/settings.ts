// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingItem } from '@/renderer/screens/Settings/types';
import { faFileExport, faFileImport } from '@fortawesome/pro-solid-svg-icons';

export const SettingsList: SettingItem[] = [
  {
    action: 'settings:execute:dockedWindow',
    category: 'General',
    enabled: true,
    helpKey: 'help:settings:dockedWindow',
    settingType: 'switch',
    title: 'Docked Window',
  },
  {
    action: 'settings:execute:showOnAllWorkspaces',
    category: 'General',
    enabled: false,
    helpKey: 'help:settings:showOnAllWorkspaces',
    settingType: 'switch',
    title: 'Show On All Workspaces',
  },
  {
    action: 'settings:execute:silenceOsNotifications',
    category: 'General',
    enabled: false,
    helpKey: 'help:settings:silenceOsNotifications',
    settingType: 'switch',
    title: 'Silence OS Notifications',
  },
  {
    action: 'settings:execute:showDebuggingSubscriptions',
    category: 'General',
    enabled: false,
    helpKey: 'help:settings:showDebuggingSubscriptions',
    settingType: 'switch',
    title: 'Show Debugging Subscriptions',
  },
  {
    action: 'settings:execute:enableAutomaticSubscriptions',
    category: 'General',
    enabled: false,
    helpKey: 'help:settings:enableAutomaticSubscriptions',
    settingType: 'switch',
    title: 'Enable Automatic Subscriptions',
  },
  {
    action: 'settings:execute:importData',
    category: 'Backup',
    buttonIcon: faFileImport,
    buttonText: 'Import',
    enabled: true,
    helpKey: 'help:settings:importData',
    settingType: 'button',
    title: 'Import Accounts',
  },
  {
    action: 'settings:execute:exportData',
    category: 'Backup',
    buttonIcon: faFileExport,
    buttonText: 'Export',
    enabled: true,
    helpKey: 'help:settings:exportData',
    settingType: 'button',
    title: 'Export Accounts',
  },
];
