// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getActiveTabs,
  getBrowserTabId,
  getPendingTabData,
  setActiveTabs,
  setBrowserTabId,
  setPendingTabData,
} from '../../state';
import { isMainTabOpen, sendChromeMessage } from '../../utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { TabData } from '@polkadot-live/types/communication';

export const handleTabMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'isTabOpen': {
      const { tab } = message;
      sendResponse(Boolean(getActiveTabs().find((t) => t.viewId === tab)));
      return true;
    }
    case 'closeTab': {
      const { tab } = message;
      const active = getActiveTabs().filter((t) => t.viewId !== tab);
      setActiveTabs(active);
      return false;
    }
    case 'openTabRelay': {
      const { tabData }: { tabData: TabData } = message.payload;

      isMainTabOpen().then((tab) => {
        const browserTabOpen = Boolean(tab);
        browserTabOpen && setBrowserTabId(tab?.id || null);
        const url = chrome.runtime.getURL(`src/tab/index.html`);

        if (browserTabOpen) {
          const browserTabId = getBrowserTabId();
          browserTabId &&
            chrome.tabs.update(Number(browserTabId), { active: true });
          sendChromeMessage('tabs', 'openTab', { tabData });
        } else {
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
