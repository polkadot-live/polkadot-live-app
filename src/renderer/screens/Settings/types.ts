// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface PersistedSettings {
  appDocked: boolean;
  appSilenceOsNotifications: boolean;
  appShowOnAllWorkspaces: boolean;
  appShowDebuggingSubscriptions: boolean;
  appEnableAutomaticSubscriptions: boolean;
  appEnablePolkassemblyApi: boolean;
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
  | 'settings:execute:keepOutdatedEvents';

export interface SettingItem {
  action: SettingAction;
  category: string;
  title: string;
  enabled: boolean;
  helpKey: HelpItemKey;
  settingType: string;
  buttonText?: string;
  buttonIcon?: IconProp;
}

export interface SettingProps {
  setting: SettingItem;
  handleSetting: (setting: SettingItem) => void;
}
