// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CSS } from '@dnd-kit/utilities';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TabWrapper } from './Wrappers';
import { useTabs } from '@ren/contexts/tabs';
import { useSortable } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import type { TabProps } from './types';

export const Tab: React.FC<TabProps> = ({ id, label }: TabProps) => {
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: activeId === id ? '20' : '1',
      }}
    >
      <TabWrapper
        $active={id === clickedId}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleClick}
      >
        <div className="inner">
          <span role="button" className="label">
            {label}
          </span>
          <div className="btn-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} transform={'shrink-2'} />
          </div>
        </div>
        <AnimatePresence>
          {id === clickedId && (
            <motion.span
              style={{
                position: 'absolute',
                inset: '0px',
                borderRadius: '0.375rem',
                backgroundColor: 'var(--nav-button-background-active)',
                zIndex: '0',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </AnimatePresence>
      </TabWrapper>
    </div>
  );
};
