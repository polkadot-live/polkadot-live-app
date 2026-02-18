// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, TabData } from '@polkadot-live/types';
import type { TabsAdapter } from './types';

export const chromeAdapter: TabsAdapter = {
  onMount: async (addTab) => {
    const data = { type: 'tabs', task: 'syncTabs' };
    const tab: null | TabData = await chrome.runtime.sendMessage(data);
    tab && addTab(tab);
  },

  onCloseTab: (closeViewId) => {
    const msg = { type: 'tabs', task: 'closeTab', tab: closeViewId };
    chrome.runtime.sendMessage(msg);
  },

  openTabFromMenu: (tab) => {
    chrome.runtime.sendMessage({
      type: 'tabs',
      task: 'openTabFromMenu',
      payload: { tab },
    });
  },

  listenOnMount: (addTab) => {
    const callback = (message: AnyData) => {
      if (message.type === 'tabs') {
        switch (message.task) {
          case 'openTab': {
            const { tabData }: { tabData: TabData } = message.payload;
            addTab(tabData);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
