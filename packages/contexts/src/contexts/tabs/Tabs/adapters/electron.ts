// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { TabsAdapter } from './types';
import type { TabData } from '@polkadot-live/types';

export const electronAdapter: TabsAdapter = {
  onMount: async () => {
    /* empty */
  },

  onCloseTab: () => {
    /* empty */
  },

  openTabFromMenu: () => {
    /* empty */
  },

  listenOnMount: (addTab) => {
    window.myAPI.handleOpenTab((_: IpcRendererEvent, tabData: TabData) => {
      addTab(tabData);
    });
    return null;
  },
};
