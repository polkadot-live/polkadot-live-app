// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { useTabs } from '@app/contexts/tabs/Tabs';
import { Header } from '@polkadot-live/ui/components';
import { useDebug } from '@app/hooks/useDebug';
import { TabsWrapper } from './Wrappers';
import { Tab } from './Tab';

export const Tabs: React.FC = () => {
  useDebug(window.myAPI.getWindowId());

  const { handleDragStart, handleDragEnd, items, sensors, tabsData } =
    useTabs();

  return (
    <>
      <Header
        onCloseWindow={() => {
          const windowId = window.myAPI.getWindowId();
          window.myAPI.closeWindow(windowId);
        }}
      />

      <TabsWrapper>
        <div className="inner">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={items}
              strategy={horizontalListSortingStrategy}
            >
              {Number(tabsData.length) === 0 && (
                <div style={{ color: 'var(--text-color-secondary)' }}>
                  No windows open.
                </div>
              )}
              {tabsData.map(({ id, label }) => (
                <Tab key={String(id)} id={id} label={label} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </TabsWrapper>
    </>
  );
};
