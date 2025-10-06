// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { version } from '../../../package.json';
import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { Header } from '../Header';
import { Tab } from './Tab';
import { TabsWrapper } from './Wrappers';
import type { TabsProps } from './types';

export const Tabs: React.FC<TabsProps> = ({
  tabsCtx,
  leftButtons,
  onCloseWindow,
}: TabsProps) => {
  const { items, sensors, tabsData } = tabsCtx;
  const { handleDragStart, handleDragEnd } = tabsCtx;

  return (
    <>
      <Header version={version} onCloseWindow={onCloseWindow} />
      <TabsWrapper>
        {leftButtons && leftButtons}
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
                <div className="NoTabsOpen">No windows open.</div>
              )}
              {tabsData.map(({ id, label }) => (
                <Tab
                  key={String(id)}
                  id={id}
                  label={label}
                  tabsCtx={{ ...tabsCtx }}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </TabsWrapper>
    </>
  );
};
