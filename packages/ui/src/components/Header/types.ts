// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface HeaderProps {
  showButtons?: boolean;
  appLoading?: boolean;
  darkMode?: boolean;
  dockToggled?: boolean;
  onCloseWindow?: () => void;
  onDockToggle?: () => void;
  onRestoreWindow?: () => void;
  onThemeToggle?: (toggled: boolean) => void;
}
