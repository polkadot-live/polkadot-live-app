// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getActiveTabs,
  getPendingTabData,
  setActiveTabs,
  setBrowserTabId,
  setPendingTabData,
} from '../../state';
import { isMainTabOpen, sendChromeMessage } from '../../utils';
import type { TabData } from '@polkadot-live/types/communication';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleTabMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'closeTab': {
      const { tab } = message;
      const active = getActiveTabs().filter((t) => t.viewId !== tab);
      setActiveTabs(active);
      return false;
    }
    case 'openTabFromMenu': {
      const { tab }: { tab: TabData } = message.payload;
      setActiveTabs([
        ...getActiveTabs().filter(({ viewId }) => tab.viewId !== viewId),
        tab,
      ]);
      return false;
    }
    case 'openTabRelay': {
      const { tabData }: { tabData: TabData } = message.payload;

      isMainTabOpen().then((tab) => {
        const browserTabOpen = Boolean(tab);
        if (browserTabOpen) {
          const tabId = tab?.id || null;
          setBrowserTabId(tabId);
          tabId && chrome.tabs.update(Number(tabId), { active: true });
          sendChromeMessage('tabs', 'openTab', { tabData });
        } else {
          const url = chrome.runtime.getURL(`src/tab/index.html`);
          setActiveTabs([]);
          setPendingTabData(tabData);
          chrome.tabs.create({ url }).then((newTab) => {
            setBrowserTabId(newTab.id || null);
          });
        }
      });
      return false;
    }
    case 'syncTabs': {
      const tabData = getPendingTabData();
      setPendingTabData(null);
      sendResponse(tabData);
      return true;
    }
    default: {
      console.warn(`Unknown tab task: ${message.task}`);
      return false;
    }
  }
};
