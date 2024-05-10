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
    title: 'Docked window',
  },
  {
    action: 'settings:execute:showOnAllWorkspaces',
    category: 'General',
    enabled: false,
    helpKey: 'help:settings:showOnAllWorkspaces',
    settingType: 'switch',
    title: 'Show on all workspaces',
  },
  {
    action: 'settings:execute:silenceOsNotifications',
    category: 'General',
    enabled: false,
    helpKey: 'help:settings:silenceOsNotifications',
    settingType: 'switch',
    title: 'Silence OS notifications',
  },
  {
    action: 'settings:execute:importData',
    category: 'Backup',
    buttonIcon: faFileImport,
    buttonText: 'Import',
    enabled: true,
    helpKey: 'help:settings:importData',
    settingType: 'button',
    title: 'Import data',
  },
  {
    action: 'settings:execute:exportData',
    category: 'Backup',
    buttonIcon: faFileExport,
    buttonText: 'Export',
    enabled: true,
    helpKey: 'help:settings:exportData',
    settingType: 'button',
    title: 'Export data',
  },
];
