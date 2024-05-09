// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingItem } from '@/renderer/screens/Settings/types';
import { faFileExport, faFileImport } from '@fortawesome/pro-solid-svg-icons';

export const SettingsList: SettingItem[] = [
  {
    category: 'General',
    enabled: true,
    settingType: 'switch',
    title: 'Docked window',
  },
  {
    category: 'General',
    enabled: false,
    settingType: 'switch',
    title: 'Show on all workspaces',
  },
  {
    category: 'General',
    enabled: false,
    settingType: 'switch',
    title: 'Silence OS notifications',
  },
  {
    category: 'Backup',
    buttonIcon: faFileImport,
    buttonText: 'Import',
    enabled: true,
    settingType: 'button',
    title: 'Import data',
  },
  {
    category: 'Backup',
    buttonIcon: faFileExport,
    buttonText: 'Export',
    enabled: true,
    settingType: 'button',
    title: 'Export data',
  },
];
