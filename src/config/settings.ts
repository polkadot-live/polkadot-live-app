// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingItem } from '@/renderer/screens/Settings/types';
import { faFileExport, faFileImport } from '@fortawesome/pro-solid-svg-icons';

export const SettingsList: SettingItem[] = [
  {
    title: 'Docked window',
    enabled: true,
    settingType: 'switch',
  },
  {
    title: 'Show on all workspaces',
    enabled: false,
    settingType: 'switch',
  },
  {
    title: 'Silence OS notifications',
    enabled: false,
    settingType: 'switch',
  },
  {
    title: 'Import data',
    enabled: true,
    settingType: 'button',
    buttonText: 'Import',
    buttonIcon: faFileImport,
  },
  {
    title: 'Export data',
    enabled: true,
    settingType: 'button',
    buttonText: 'Export',
    buttonIcon: faFileExport,
  },
];
