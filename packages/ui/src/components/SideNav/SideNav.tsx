// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavItemWrapper, SideNavWrapper } from './SideNav.styles';
import { NavItem } from './NavItem';
import {
  faBarsStaggered,
  faCubesStacked,
  faDownLeftAndUpRightToCenter,
  faGaugeSimple,
  faPaperPlane,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import type { SideNavProps } from './SideNav.types';

export const SideNav = ({ handleSideNavCollapse, navState }: SideNavProps) => {
  const { isCollapsed } = navState;

  return (
    <SideNavWrapper $isCollapsed={isCollapsed}>
      <NavItem
        id={0}
        navState={navState}
        icon={faGaugeSimple}
        label={'Summary'}
      />
      <NavItem
        id={1}
        navState={navState}
        icon={faBarsStaggered}
        label={'Events'}
      />
      <NavItem
        id={2}
        navState={navState}
        icon={faCubesStacked}
        label={'Subscribe'}
      />
      <NavItem id={3} navState={navState} icon={faPaperPlane} label={'Send'} />

      <NavItemWrapper
        $active={false}
        $size={'half'}
        style={
          isCollapsed
            ? { marginTop: 'auto' }
            : { marginTop: 'auto', maxWidth: '48px' }
        }
        onClick={() => handleSideNavCollapse()}
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
