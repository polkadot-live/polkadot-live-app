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
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Header } from '@/renderer/library/Header';
import styled from 'styled-components';
import { useDebug } from '@/renderer/hooks/useDebug';

/* -------------------- */
/* Tabs Container       */
/* -------------------- */

const TabsWrapper = styled.div`
  margin-top: 3rem; // header height offset
  user-select: none;
  width: 100%;
  height: 49px;
  background-color: #181818;
  border-bottom: 1px solid #222;
  border-left: 1px solid rgba(70, 70, 70, 0.3);
  border-right: 1px solid rgba(70, 70, 70, 0.3);

  .inner {
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    height: 100%;
    padding: 0 1.15rem;
  }
`;

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

/* -------------------- */
/* Tab Component        */
/* -------------------- */

interface TabProps {
  id: number;
  label: string;
}

const CloseButtonWrapper = styled.div`
  &:hover {
    svg {
      color: #cfcfcf;
      cursor: pointer;
    }
  }
`;

const Tab: React.FC<TabProps> = ({ id, label }: TabProps) => {
  const { activeId, clickedId, handleTabClick, handleTabClose } = useTabs();

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
    backgroundColor: '#282828',
    borderRadius: '1.5rem',
    zIndex: activeId === id ? '20' : '1',
    minWidth: '115px',
    padding: '0.3rem 0',
    marginTop: '-5px',
    cursor: 'pointer',
  };

  const outerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    columnGap: '0.25rem',
    padding: '0.4rem 1.25rem',
    fontSize: '1.05rem',
    color: '#666',
  };

  /// Handle tab click.
  const handleClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (clickedId !== id) {
      handleTabClick(id);
    }
  };

  /// Handle close tab.
  const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    handleTabClose(id);
  };

  return (
    <div ref={setNodeRef} style={parentStyle} {...attributes} {...listeners}>
      <div style={outerStyle} onClick={handleClick}>
        <span
          role="button"
          style={{
            flexGrow: '1',
            color: clickedId === id ? '#cfcfcf' : '#838383',
          }}
        >
          {label}
        </span>
        <CloseButtonWrapper onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} transform={'shrink-2'} />
        </CloseButtonWrapper>
      </div>
    </div>
  );
};
