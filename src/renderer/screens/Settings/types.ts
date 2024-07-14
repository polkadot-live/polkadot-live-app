// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { WorkspaceItem } from '@/types/developerConsole/workspaces';

export interface PersistedSettings {
  appDocked: boolean;
  appSilenceOsNotifications: boolean;
  appShowOnAllWorkspaces: boolean;
  appShowDebuggingSubscriptions: boolean;
  appEnableAutomaticSubscriptions: boolean;
  appEnablePolkassemblyApi: boolean;
  appKeepOutdatedEvents: boolean;
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
  | 'settings:execute:hideDockIcon';

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

export interface WorkspaceRowProps {
  workspace: WorkspaceItem;
}
