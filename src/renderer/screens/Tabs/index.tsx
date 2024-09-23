// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { useTabs } from '@/renderer/contexts/tabs/Tabs';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import { Header } from '@/renderer/library/Header';

/* -------------------- */
/* Tabs Container       */
/* -------------------- */

const TabsWrapper = styled.div`
  margin-top: 3rem; // header height offset
  user-select: none;
  width: 100%;
  height: 49px;
  background-color: black;
  border-bottom: 1px solid #222;

  .inner {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    height: 100%;
    padding: 0 1.25rem;
  }
`;

export const Tabs: React.FC = () => {
  const { handleDragStart, handleDragEnd, items, sensors } = useTabs();

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
              {items.map((id) => (
                <Tab key={String(id)} id={id} label={`Tab ${id}`} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </TabsWrapper>
    </>
  );
};

/* -------------------- */
/* Tab Component        */
/* -------------------- */

interface TabProps {
  id: number;
  label: string;
}

const Tab: React.FC<TabProps> = ({ id, label }: TabProps) => {
  const { activeId, clickedId, setClickedId } = useTabs();

  /// Dnd
  const { attributes, listeners, transform, transition, setNodeRef } =
    useSortable({
      id,
      transition: { duration: 250, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
    });

  /// Styles
  const parentStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: clickedId === id ? '#202020' : '#333',
    border: `1px solid ${clickedId === id ? '#aaa' : '#777'}`,
    borderRadius: '0.25rem',
    zIndex: activeId === id ? '20' : '1',
  };

  const outerStyle: React.CSSProperties = {
    padding: '0.4rem 2rem',
    fontSize: '1rem',
    fontWeight: '500',
    color: 'grey',
  };

  /// Click
  const handleClick = () => {
    if (clickedId !== id) {
      setClickedId(id);
      console.log(`Tab ${id} clicked...`);
      //TODO: window.myAPI.changeTab(id);
    }
  };

  return (
    <div ref={setNodeRef} style={parentStyle} {...attributes} {...listeners}>
      <div style={outerStyle} onClick={handleClick}>
        <span role="button">{label}</span>
      </div>
    </div>
  );
};
