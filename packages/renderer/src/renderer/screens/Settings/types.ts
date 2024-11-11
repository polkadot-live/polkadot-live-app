// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { WorkspaceItem } from '@polkadot-live/types/developerConsole/workspaces';
import type { OsPlatform, SettingAction } from '@polkadot-live/types/settings';

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

export interface SettingProps {
  setting: SettingItem;
  handleSetting: (setting: SettingItem) => void;
}

export interface WorkspaceRowProps {
  workspace: WorkspaceItem;
}
