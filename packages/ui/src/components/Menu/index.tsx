// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setStateWithRef } from '@w3ux/utils';
import { useOutsideAlerter } from '../../hooks/useOutsideAlerter';
import React, { useRef, useState } from 'react';
import { MenuWrapper, Separator } from './Wrapper';
import {
  faBell,
  faBellSlash,
  faCog,
  faLinkSlash,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import type { MenuProps } from './types';

export const Menu = ({
  menuItems,
  appFlags: { isAborting, isConnecting, isOnline, isLoading },
  silenceOsNotifications,
  connectLabel,
  onConnectClick,
  onSilenceNotifications,
}: MenuProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuOpenRef = useRef(menuOpen);

  const toggleMenu = (val: boolean) => {
    setStateWithRef(val, setMenuOpen, menuOpenRef);
  };

  const alerterRf = useRef(null);

  useOutsideAlerter(
    alerterRf,
    () => {
      toggleMenu(!menuOpenRef.current);
    },
    ['dropdown-toggle']
  );

  return (
    <>
      {menuOpenRef.current && (
        <button type="button" onClick={() => toggleMenu(false)}>
          <FontAwesomeIcon icon={faCog} transform="grow-1" />
        </button>
      )}
      {!menuOpenRef.current && (
        <button type="button" onClick={() => toggleMenu(true)}>
          <FontAwesomeIcon icon={faCog} transform="grow-1" />
        </button>
      )}
      {menuOpenRef.current && (
        <MenuWrapper ref={alerterRf}>
          {menuItems.map(
            ({ appendSeparator, keepMenuOpen, disabled, label, onClick }) => (
              <React.Fragment key={`menu-item-${label}`}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onClick();
                    !keepMenuOpen && toggleMenu(false);
                  }}
                >
                  {label}
                </button>
                {appendSeparator && <Separator style={{ opacity: '0.5' }} />}
              </React.Fragment>
            )
          )}

          {/* Controls */}
          <section className="controls" style={{ width: '100%' }}>
            <div className="controls-wrapper">
              {/* Connection button */}
              <div className="connect-wrapper">
                <ButtonSecondary
                  className={
                    (isConnecting && !isAborting) || (isLoading && !isAborting)
                      ? 'menu-btn do-pulse'
                      : isAborting || isConnecting || isLoading
                        ? 'menu-btn do-pulse'
                        : 'menu-btn'
                  }
                  text={
                    isAborting
                      ? 'Aborting...'
                      : isConnecting || isLoading
                        ? 'Abort'
                        : connectLabel
                  }
                  iconLeft={isOnline ? faLinkSlash : faWifi}
                  iconTransform="shrink-4"
                  disabled={isAborting}
                  onClick={async () => await onConnectClick()}
                />
              </div>

              {/* Silence notifications */}
              <ButtonSecondary
                className="menu-btn"
                text={silenceOsNotifications ? 'Unsilence' : 'Silence'}
                iconLeft={silenceOsNotifications ? faBellSlash : faBell}
                iconTransform="shrink-3"
                onClick={() => onSilenceNotifications()}
              />
            </div>
          </section>
        </MenuWrapper>
      )}
    </>
  );
};
