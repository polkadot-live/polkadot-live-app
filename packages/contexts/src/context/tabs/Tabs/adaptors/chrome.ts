// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TabsAdaptor } from './types';
import type { AnyData, TabData } from '@polkadot-live/types';

export const chromeAdapter: TabsAdaptor = {
  onMount: async (addTab) => {
    const data = { type: 'tabs', task: 'syncTabs' };
    const tab: null | TabData = await chrome.runtime.sendMessage(data);
    tab && addTab(tab);
  },

  onCloseTab: (closeViewId) => {
    const msg = { type: 'tabs', task: 'closeTab', tab: closeViewId };
    chrome.runtime.sendMessage(msg);
  },

  onClickTab: () => {
    /* empty */
  },

  listenOnMount: (addTab) => {
    const callback = (message: AnyData) => {
      if (message.type !== 'tabs' && message.type !== 'openTab') {
        return;
      }
      const { tabData }: { tabData: TabData } = message.payload;
      addTab(tabData);
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
