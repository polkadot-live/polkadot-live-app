// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TabData } from '@polkadot-live/types';

export interface TabsAdaptor {
  onMount: (addTab: (tab: TabData) => void) => Promise<void>;
  listenOnMount: (addTab: (tab: TabData) => void) => (() => void) | null;
}
