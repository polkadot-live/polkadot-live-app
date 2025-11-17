// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavItemWrapper, SideNavWrapper } from './SideNav.styles';
import { NavItem } from './NavItem';
import type { SideNavProps } from './SideNav.types';

export const SideNav = ({ handleSideNavCollapse, navState }: SideNavProps) => {
  const { isCollapsed } = navState;

  return (
    <SideNavWrapper $isCollapsed={isCollapsed}>
      <NavItem
        id={0}
        navState={navState}
        icon={FA.faGaugeSimple}
        label={'Summary'}
      />
      <NavItem
        id={1}
        navState={navState}
        icon={FA.faBarsStaggered}
        label={'Events'}
      />
      <NavItem id={2} navState={navState} icon={FA.faLink} label={'Chains'} />
      <NavItem
        id={3}
        navState={navState}
        icon={FA.faCubesStacked}
        label={'Accounts'}
      />
      <NavItem
        id={4}
        navState={navState}
        icon={FA.faComments}
        label={'OpenGov'}
      />
      <NavItem
        id={5}
        navState={navState}
        icon={FA.faPaperPlane}
        label={'Send'}
      />

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
              ? FA.faUpRightAndDownLeftFromCenter
              : FA.faDownLeftAndUpRightToCenter
          }
          transform={'shrink-2'}
        />
      </NavItemWrapper>
    </SideNavWrapper>
  );
};
