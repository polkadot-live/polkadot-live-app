// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { TabsContextInterface } from './types';
import type { TabData } from '@/types/communication';

export const TabsContext = createContext<TabsContextInterface>(
  defaults.defaultTabsContext
);

export const useTabs = () => useContext(TabsContext);

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [clickedId, setClickedId] = useState<number | null>(null);
  const [items, setItems] = useState<number[]>([]);

  const [tabsData, setTabsData] = useState<TabData[]>([]);
  const tabsDataRef = useRef<TabData[]>(tabsData);

  /// Callback.
  useEffect(() => {
    window.myAPI.handleOpenTab((_, tabData) => {
      const found = tabsDataRef.current.find(
        ({ viewId }) => viewId === tabData.viewId
      );

      if (found !== undefined) {
        setClickedId(found.id);
      } else {
        tabsDataRef.current = [...tabsDataRef.current, tabData];
        tabData.id = tabsDataRef.current.length;

        setItems((prev) => [...prev, tabData.id]);
        setTabsData((prev) => [...prev, tabData]);
        setClickedId(tabData.id);
      }
    });
  }, []);

  /// Sensors.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /// Drag start handler.
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active) {
      setActiveId(Number(active.id));
    }
  };

  /// Drag end handler.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(Number(active.id));
      const newIndex = items.indexOf(Number(over.id));

      setItems((prev) => arrayMove(prev, oldIndex, newIndex));
      setTabsData((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  /// Click handler.
  const handleTabClick = (id: number) => {
    setClickedId(id);
    const { viewId } = tabsData.find((t) => t.id === id)!;
    window.myAPI.showTab(viewId);
  };

  return (
    <TabsContext.Provider
      value={{
        activeId,
        clickedId,
        items,
        sensors,
        tabsData,
        setClickedId,
        handleDragStart,
        handleDragEnd,
        handleTabClick,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};
