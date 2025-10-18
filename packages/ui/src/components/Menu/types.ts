// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AppFlags, MenuItemData } from '@polkadot-live/types/menu';

export interface MenuProps {
  appFlags: AppFlags;
  silenceOsNotifications: boolean;
  connectLabel: string;
  menuItems: MenuItemData[];
  onSilenceNotifications: () => void;
  onConnectClick: () => Promise<void>;
}
