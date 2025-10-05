// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  DragEndEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import type { TabData } from '@polkadot-live/types';

export interface TabProps {
  id: number;
  label: string;
  tabsCtx: {
    activeId: number | null;
    clickedId: number | null;
    handleTabClick: (id: number) => void;
    handleTabClose: (id: number) => void;
  };
}
export interface TabsProps {
  tabsCtx: {
    activeId: number | null;
    clickedId: number | null;
    items: number[];
    sensors: SensorDescriptor<SensorOptions>[];
    tabsData: TabData[];
    handleDragEnd: (event: DragEndEvent) => void;
    handleDragStart: (event: DragStartEvent) => void;
    handleTabClick: (id: number) => void;
    handleTabClose: (id: number) => void;
  };
  leftButtons?: React.ReactNode;
}
