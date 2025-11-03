// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TabData } from '@polkadot-live/types/communication';

let ACTIVE_TABS: TabData[] = [];
let PENDING_TAB_DATA: TabData | null = null;
let BROWSER_TAB_ID: number | null = null;

export const getActiveTabs = (): TabData[] => ACTIVE_TABS;
export const setActiveTabs = (tabs: TabData[]): void => {
  ACTIVE_TABS = tabs;
};

export const getPendingTabData = (): TabData | null => PENDING_TAB_DATA;
export const setPendingTabData = (data: TabData | null): void => {
  PENDING_TAB_DATA = data;
};

export const getBrowserTabId = (): number | null => BROWSER_TAB_ID;
export const setBrowserTabId = (id: number | null): void => {
  BROWSER_TAB_ID = id;
};
