// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TabData } from '@polkadot-live/types';

export interface TabsAdapter {
  onMount: (addTab: (tab: TabData) => void) => Promise<void>;
  onCloseTab: (closeViewId: string, showViewId: string | null) => void;
  onClickTab: (viewId: string) => void;
  openTabFromMenu: (tab: TabData) => void;
  listenOnMount: (addTab: (tab: TabData) => void) => (() => void) | null;
}
