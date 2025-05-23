// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
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
import { version } from '../../../package.json';
import { useTabs } from '@ren/contexts/tabs';
import { Header } from '@polkadot-live/ui/components';
import { useDebug } from '@ren/hooks/useDebug';
import { TabsWrapper } from './Wrappers';
import { Tab } from './Tab';
import { ResizeToggles } from './ResizeToggles';

export const Tabs: React.FC = () => {
  useDebug(window.myAPI.getWindowId());

  const { handleDragStart, handleDragEnd, items, sensors, tabsData } =
    useTabs();

  return (
    <>
      <Header
        version={version}
        onCloseWindow={() => {
          const windowId = window.myAPI.getWindowId();
          window.myAPI.closeWindow(windowId);
        }}
      />

      <TabsWrapper>
        <ResizeToggles />
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
