// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { TabsContextInterface } from './types';

export const TabsContext = createContext<TabsContextInterface>(
  defaults.defaultTabsContext
);

export const useTabs = () => useContext(TabsContext);

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [clickedId, setClickedId] = useState<number | null>(null);
  const [items, setItems] = useState<number[]>(
    Array.from({ length: 3 }, (_, index) => index + 1)
  );

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
      setItems((prev) => {
        const oldIndex = prev.indexOf(Number(active.id));
        const newIndex = prev.indexOf(Number(over.id));
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <TabsContext.Provider
      value={{
        activeId,
        clickedId,
        items,
        sensors,
        setClickedId,
        handleDragStart,
        handleDragEnd,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};
