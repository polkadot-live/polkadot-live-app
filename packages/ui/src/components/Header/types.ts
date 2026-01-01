// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { darkTheme } from '@polkadot-live/styles/theme/variables';

export interface HeaderProps {
  theme: typeof darkTheme;
  appLoading?: boolean;
  showButtons?: boolean;
  showDock?: boolean;
  showMinimize?: boolean;
  dockToggled?: boolean;
  version?: string;
  ToggleNode?: React.ReactNode;
  onCloseWindow?: () => void;
  onClickTag?: () => void;
  onDockToggle?: () => void;
  onMinimizeWindow?: () => void;
  children?: React.ReactNode;
}
