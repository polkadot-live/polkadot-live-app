// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface MenuProps {
  appFlags: AppFlags;
  silenceOsNotifications: boolean;
  connectLabel: string;
  menuItems: MenuItemData[];
  onSilenceNotifications: () => void;
  onConnectClick: () => Promise<void>;
}

export interface AppFlags {
  isAborting: boolean;
  isConnecting: boolean;
  isOnline: boolean;
  isLoading: boolean;
}

export interface MenuItemData {
  label: string;
  disabled: boolean;
  keepMenuOpen?: boolean;
  appendSeparator?: boolean;
  onClick: () => void;
}
