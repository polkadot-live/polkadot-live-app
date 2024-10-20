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
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import { useSideNav } from '../contexts';
import { useAppSettings } from '@/renderer/contexts/main/AppSettings';

export const SideNav = () => {
  const { handleSideNavCollapse } = useAppSettings();
  const { isCollapsed } = useSideNav();

  return (
    <SideNavWrapper $isCollapsed={isCollapsed}>
      <NavItem id={0} icon={faGaugeSimple} label={'Summary'} />
      <NavItem id={1} icon={faBarsStaggered} label={'Events'} />
      <NavItem id={2} icon={faCubesStacked} label={'Subscribe'} />

      <NavItemWrapper
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
