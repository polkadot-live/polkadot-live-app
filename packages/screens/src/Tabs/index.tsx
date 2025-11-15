// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { version } from '../../package.json';
import { useTabs } from '@polkadot-live/contexts';
import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { DropdownOpenTabs } from './Dropdowns';
import { Header } from '@polkadot-live/ui/components';
import { Tab } from './Tab';
import { TabsWrapper } from './Wrappers';
import type { TabsProps } from './types';

export const Tabs = ({ leftButtons, platform, onCloseWindow }: TabsProps) => {
  const { items, sensors, tabsData } = useTabs();
  const { handleDragStart, handleDragEnd } = useTabs();

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
                <div className="NoTabsOpen">No tabs open.</div>
              )}
              {tabsData.map(({ id, label }) => (
                <Tab key={String(id)} id={id} label={label} />
              ))}
            </SortableContext>
          </DndContext>
          {platform === 'chrome' && <DropdownOpenTabs />}
        </div>
      </TabsWrapper>
    </>
  );
};
