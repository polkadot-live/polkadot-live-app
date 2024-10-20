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
import { useDebug } from '@/renderer/hooks/useDebug';
import { TabsWrapper, TabWrapper } from './Wrappers';

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

const Tab: React.FC<TabProps> = ({ id, label }: TabProps) => {
  const { activeId, clickedId, handleTabClick, handleTabClose } = useTabs();

  /// Dnd
  const { attributes, listeners, transform, transition, setNodeRef } =
    useSortable({
      id,
      transition: { duration: 250, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
    });

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
    <TabWrapper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: activeId === id ? '20' : '1',
      }}
    >
      <div className="inner" onClick={handleClick}>
        <span
          role="button"
          style={{
            flexGrow: '1',
            color: clickedId === id ? '#cfcfcf' : '#838383',
          }}
        >
          {label}
        </span>
        <div className="btn-close" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} transform={'shrink-2'} />
        </div>
      </div>
    </TabWrapper>
  );
};
