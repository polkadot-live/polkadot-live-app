// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
