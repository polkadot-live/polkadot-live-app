// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavItemWrapper, SideNavWrapper } from './SideNav.styles';
import { NavItem } from './NavItem';
import {
  faBarsStaggered,
  faCubesStacked,
  faDownLeftAndUpRightToCenter,
  faGaugeSimple,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import type { SideNavProps } from './SideNav.types';

export const SideNav = ({ selected, setSelected }: SideNavProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SideNavWrapper $isCollapsed={isCollapsed}>
      <NavItem
        selected={selected === 0}
        id={0}
        setSelected={setSelected}
        isCollapsed={isCollapsed}
        icon={faGaugeSimple}
        label={'Summary'}
      />

      <NavItem
        selected={selected === 1}
        id={1}
        setSelected={setSelected}
        isCollapsed={isCollapsed}
        icon={faBarsStaggered}
        label={'Events'}
      />

      <NavItem
        selected={selected === 2}
        id={2}
        setSelected={setSelected}
        isCollapsed={isCollapsed}
        icon={faCubesStacked}
        label={'Subscribe'}
      />

      <NavItemWrapper
        $size={'half'}
        style={
          isCollapsed
            ? { marginTop: 'auto' }
            : { marginTop: 'auto', maxWidth: '48px' }
        }
        onClick={() => setIsCollapsed((pv) => !pv)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon
          icon={
            isCollapsed
              ? faUpRightAndDownLeftFromCenter
              : faDownLeftAndUpRightToCenter
          }
          transform={'shrink-2'}
        />
      </NavItemWrapper>
    </SideNavWrapper>
  );
};
