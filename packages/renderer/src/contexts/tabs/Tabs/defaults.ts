// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TabsContextInterface } from './types';

export const defaultTabsContext: TabsContextInterface = {
  activeId: null,
  clickedId: null,
  items: [],
  sensors: [],
  tabsData: [],
  setClickedId: () => {},
  handleDragStart: () => {},
  handleDragEnd: () => {},
  handleTabClick: () => {},
  handleTabClose: () => {},
};
