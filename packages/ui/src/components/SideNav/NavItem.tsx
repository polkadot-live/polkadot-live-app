// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { TooltipRx } from '../TooltipRx';
import { NavItemWrapper } from './SideNav.styles';
import type { AnyData } from '@polkadot-live/types/misc';
import type { NavItemProps } from './SideNav.types';

const TooltipWrapper = ({
  isCollapsed,
  label,
  theme,
  children,
}: {
  isCollapsed: boolean;
  label: string;
  theme: AnyData;
  children: React.ReactNode;
}) => {
  if (isCollapsed) {
    return (
      <TooltipRx theme={theme} text={label} side="right">
        {children}
      </TooltipRx>
    );
  } else {
    return children;
  }
};

export const NavItem = ({
  children,
  id,
  icon,
  label,
  navState: { isCollapsed, selectedId, setSelectedId },
  theme,
}: NavItemProps) => (
  <TooltipWrapper isCollapsed={isCollapsed} label={label || ''} theme={theme}>
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
            transform={isCollapsed ? 'grow-0' : 'grow-2'}
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
            data-testid={`item-${id}-selected`}
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
  </TooltipWrapper>
);
