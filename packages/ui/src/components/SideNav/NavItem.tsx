// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavItemWrapper } from './SideNav.styles';
import type { NavItemProps } from './SideNav.types';

export const NavItem = ({
  children,
  id,
  icon,
  label,
  navState: { isCollapsed, selectedId, setSelectedId },
}: NavItemProps) => (
  <NavItemWrapper
    $size={isCollapsed ? 'half' : 'fill'}
    $active={id === selectedId}
    onClick={() => setSelectedId(id)}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="children-container">
      {children && children}
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          transform={isCollapsed ? 'shrink-1' : 'grow-4'}
          style={{ marginTop: isCollapsed ? '0.5rem' : '0.5rem' }}
        />
      )}
      {!isCollapsed && label && (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.h2>
      )}
    </span>
    <AnimatePresence>
      {id === selectedId && (
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
  </NavItemWrapper>
);
