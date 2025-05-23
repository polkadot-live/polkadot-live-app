// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface HeaderProps {
  showButtons?: boolean;
  showDock?: boolean;
  showMinimize?: boolean;
  appLoading?: boolean;
  dockToggled?: boolean;
  version?: string;
  ToggleNode?: React.ReactNode;
  onCloseWindow?: () => void;
  onDockToggle?: () => void;
  onMinimizeWindow?: () => void;
  children?: React.ReactNode;
}
