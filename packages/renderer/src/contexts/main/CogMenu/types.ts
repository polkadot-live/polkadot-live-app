// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MenuItemData, AppFlags } from '@polkadot-live/ui/components';

export interface CogMenuContextInterface {
  getAppFlags: () => AppFlags;
  getConnectionButtonText: () => string;
  getMenuItems: () => MenuItemData[];
  handleAbortConnecting: () => void;
  handleConnectClick: () => Promise<void>;
  handleSilenceNotifications: () => void;
}
