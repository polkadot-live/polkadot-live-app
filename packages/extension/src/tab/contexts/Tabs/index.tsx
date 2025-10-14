// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { AnyData } from '@polkadot-live/types/misc';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { TabsContextInterface } from './types';
import type { TabData } from '@polkadot-live/types/communication';

export const TabsContext = createContext<TabsContextInterface | undefined>(
  undefined
);

export const useTabs = createSafeContextHook(TabsContext, 'TabsContext');

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
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
      ({ viewId }) => viewId === tab.viewId
    );
    if (found !== undefined) {
      setClickedId(found.id);
    } else {
      let tabId = Number(tabsDataRef.current.length) + 1;
      const takenIds = tabsDataRef.current.reduce(
        (acc, item) => [...acc, item.id],
        [] as number[]
      );
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
   * Open tab callback.
   */
  useEffect(() => {
    // Get the requested tab from background worker on mount.
    const sync = async () => {
      const data = { type: 'tabs', task: 'syncTabs' };
      const tab: null | TabData = await chrome.runtime.sendMessage(data);
      tab && addTab(tab);
    };

    // Handle receiving a new request to open a tab.
    const callback = (message: AnyData) => {
      if (message.type !== 'tabs' && message.type !== 'openTab') {
        return;
      }
      const { tabData }: { tabData: TabData } = message;
      addTab(tabData);
    };

    sync();
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
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
    })
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
    const filtered = tabsData.filter((t) => t.id !== id);

    // Get index of next tab to show.
    let showIndex: number | null = null;
    items.length > 1 &&
      (showIndex = itemIndex === 0 ? itemIndex + 1 : itemIndex - 1);
    const maybeShowViewId: string | null =
      showIndex !== null ? tabsData.at(showIndex)!.viewId : null;

    // If the destroyed tab is in focus, give focus to the next tab to show.
    if (maybeShowViewId !== null && clickedId === id) {
      const { id: showId } = filtered.find(
        (t) => t.viewId === maybeShowViewId
      )!;
      setClickedId(showId);
    }

    // Remove destroyed tab's item and data.
    setItems((prev) => prev.filter((n) => n !== id));
    setTabsData(filtered);
    tabsDataRef.current = [...filtered];
    !tabsDataRef.current.length && setClickedId(null);
  };

  return (
    <TabsContext
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
        handleTabClose,
      }}
    >
      {children}
    </TabsContext>
  );
};
