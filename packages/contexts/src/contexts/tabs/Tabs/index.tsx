// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getTabsAdapter } from './adapters';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { TabData } from '@polkadot-live/types/communication';
import type { TabsContextInterface } from '../../../types/tabs';

export const TabsContext = createContext<TabsContextInterface | undefined>(
  undefined,
);

export const useTabs = createSafeContextHook(TabsContext, 'TabsContext');

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const adapter = getTabsAdapter();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [clickedId, setClickedId] = useState<number | null>(null);
  const [items, setItems] = useState<number[]>([]);

  const [tabsData, setTabsData] = useState<TabData[]>([]);
  const tabsDataRef = useRef<TabData[]>(tabsData);

  /**
   * Handle a new request for adding a tab.
   */
  const addTab = (tab: TabData) => {
    const found = tabsDataRef.current.find(
      ({ viewId }) => viewId === tab.viewId,
    );
    if (found !== undefined) {
      setClickedId(found.id);
    } else {
      let tabId = Number(tabsDataRef.current.length) + 1;
      const takenIds = tabsDataRef.current.map((item) => item.id);
      while (takenIds.includes(tabId)) {
        tabId += 1;
      }
      tab.id = tabId;
      tabsDataRef.current = [...tabsDataRef.current, tab];
      setItems((prev) => [...prev, tab.id]);
      setTabsData((prev) => [...prev, tab]);
      setClickedId(tab.id);
    }
  };

  /**
   * Open tab called from the tabs window (extension).
   */
  const openTabFromMenu = (tab: TabData) => {
    const { viewId } = tab;
    const found = tabsDataRef.current.find((t) => t.viewId === viewId);
    if (found) {
      addTab(found);
    } else {
      const ids = tabsDataRef.current.map((t) => t.id);
      tab.id = (ids.length ? Math.max(...ids) : 0) + 1;
      addTab(tab);
      adapter.openTabFromMenu(tab);
    }
  };

  /**
   * Check pending tabs on mount (chrome).
   */
  useEffect(() => {
    const sync = async () => {
      await adapter.onMount(addTab);
    };
    sync();
  }, []);

  /**
   * Listen for messages.
   */
  useEffect(() => {
    const removeListener = adapter.listenOnMount(addTab);
    return () => {
      removeListener?.();
    };
  }, []);

  /**
   * Sensors.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   * Drag start handler.
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active) {
      setActiveId(Number(active.id));
    }
  };

  /**
   * Drag end handler.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(Number(active.id));
      const newIndex = items.indexOf(Number(over.id));

      setItems((prev) => arrayMove(prev, oldIndex, newIndex));
      setTabsData((prev) => {
        const moved = arrayMove(prev, oldIndex, newIndex);
        tabsDataRef.current = [...moved];
        return moved;
      });
    }
  };

  /**
   * Click handler.
   */
  const handleTabClick = (id: number) => {
    setClickedId(id);
  };

  /**
   * Close handler.
   */
  const handleTabClose = (id: number) => {
    const itemIndex = items.indexOf(id);
    const tabData = tabsData.find((t) => t.id === id);
    const filtered = tabsData.filter((t) => t.id !== id);

    // Get index of next tab to show.
    let showIndex: number | null = null;
    if (items.length > 1) {
      const val = itemIndex === 0 ? itemIndex + 1 : itemIndex - 1;
      showIndex = val;
    }
    const maybeShowViewId: string | null =
      showIndex !== null ? tabsData.at(showIndex)!.viewId : null;

    // If the destroyed tab is in focus, give focus to the next tab to show.
    if (maybeShowViewId !== null && clickedId === id) {
      const { id: showId } = filtered.find(
        (t) => t.viewId === maybeShowViewId,
      )!;
      setClickedId(showId);
    }

    // Remove destroyed tab's item and data.
    setItems((prev) => prev.filter((n) => n !== id));
    setTabsData(filtered);
    tabsDataRef.current = [...filtered];
    !tabsDataRef.current.length && setClickedId(null);

    if (tabData) {
      adapter.onCloseTab(tabData.viewId, maybeShowViewId || null);
    }
  };

  return (
    <TabsContext
      value={{
        activeId,
        clickedId,
        items,
        sensors,
        tabsData,
        addTab,
        setClickedId,
        handleDragStart,
        handleDragEnd,
        handleTabClick,
        handleTabClose,
        openTabFromMenu,
      }}
    >
      {children}
    </TabsContext>
  );
};
