// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { version } from '../../package.json';
import {
  useConnections,
  useDialogControl,
  useTabs,
} from '@polkadot-live/contexts';
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
import { Header } from '@polkadot-live/ui';
import { Tab } from './Tab';
import { TabsWrapper } from './Wrappers';
import { GITHUB_LATEST_RELEASE_URL } from '@polkadot-live/consts';
import type { TabsProps } from './types';

export const Tabs = ({ leftButtons, onCloseWindow }: TabsProps) => {
  const { getTheme, openInBrowser } = useConnections();
  const { items, sensors, tabsData } = useTabs();
  const { dialogIsOpen } = useDialogControl();
  const { handleDragStart, handleDragEnd } = useTabs();

  return (
    <>
      <Header
        theme={getTheme()}
        onCloseWindow={onCloseWindow}
        onClickTag={() => openInBrowser(GITHUB_LATEST_RELEASE_URL)}
        version={version}
      />
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
              {!dialogIsOpen &&
                tabsData.map(({ id, label }) => (
                  <Tab key={String(id)} id={id} label={label} />
                ))}
            </SortableContext>
          </DndContext>
          <DropdownOpenTabs />
          {Number(tabsData.length) === 0 && (
            <div className="NoTabsOpen">No tabs open.</div>
          )}
        </div>
      </TabsWrapper>
    </>
  );
};
