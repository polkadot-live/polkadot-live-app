// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { TabsAdaptor } from './types';
import type { TabData } from '@polkadot-live/types';

export const electronAdapter: TabsAdaptor = {
  onMount: async () => {
    /* empty */
  },

  onCloseTab: (closeViewId, showViewId) => {
    window.myAPI.closeTab(closeViewId, showViewId);
  },

  onClickTab: (viewId) => {
    window.myAPI.showTab(viewId);
  },

  listenOnMount: (addTab) => {
    window.myAPI.handleOpenTab((_: IpcRendererEvent, tabData: TabData) => {
      addTab(tabData);
    });
    return null;
  },
};
