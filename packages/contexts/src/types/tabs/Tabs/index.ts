// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { TabData } from '@polkadot-live/types/communication';

export interface TabsContextInterface {
  activeId: number | null;
  clickedId: number | null;
  items: number[];
  sensors: AnyData;
  tabsData: TabData[];
  addTab: (tab: TabData) => void;
  setClickedId: React.Dispatch<React.SetStateAction<number | null>>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleTabClick: (id: number) => void;
  handleTabClose: (id: number) => void;
  openTabFromMenu: (tab: TabData) => void;
}
