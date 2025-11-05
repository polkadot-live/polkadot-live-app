// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { TabsAdaptor } from './types';
import type { TabData } from '@polkadot-live/types';

export const electronAdapter: TabsAdaptor = {
  onMount: async (addTab) => {
    window.myAPI.handleOpenTab((_: IpcRendererEvent, tabData: TabData) => {
      addTab(tabData);
    });
  },

  listenOnMount: () => null,
};
