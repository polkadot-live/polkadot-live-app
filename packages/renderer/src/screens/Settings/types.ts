// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WorkspaceItem } from '@polkadot-live/types/developerConsole/workspaces';
import type { SettingItem } from '@polkadot-live/types/settings';

export interface SettingProps {
  setting: SettingItem;
  handleSetting: (setting: SettingItem) => void;
}

export interface WorkspaceRowProps {
  workspace: WorkspaceItem;
}
