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
import { useTabs } from '@/renderer/contexts/tabs/Tabs';
import { Header } from '@app/library/components';
import { useDebug } from '@/renderer/hooks/useDebug';
import { TabsWrapper } from './Wrappers';
import { Tab } from './Tab';

export const Tabs: React.FC = () => {
  useDebug(window.myAPI.getWindowId());

  const { handleDragStart, handleDragEnd, items, sensors, tabsData } =
    useTabs();

  return (
    <>
      <Header showMenu={false} appLoading={false} />
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
                <div style={{ color: '#8f8f8f' }}>No windows open.</div>
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
