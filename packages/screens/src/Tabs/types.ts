// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface TabProps {
  id: number;
  label: string;
}
export interface TabsProps {
  platform: 'chrome' | 'electron';
  leftButtons?: React.ReactNode;
  onCloseWindow?: () => void;
}
