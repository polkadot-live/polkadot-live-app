// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setStateWithRef } from '@w3ux/utils';
import { useOutsideAlerter } from '@app/library/Hooks/useOutsideAlerter';
import { useRef, useState } from 'react';
import { MenuWrapper } from './Wrapper';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import { useBootstrapping } from '@/renderer/contexts/Bootstrapping';
import {
  faBell,
  faBellSlash,
  faCog,
  faLock,
  faUnlock,
} from '@fortawesome/pro-solid-svg-icons';
import { Config as RendererConfig } from '@/config/processes/renderer';

export const Menu = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuOpenRef = useRef(menuOpen);

  /// App settings.
  const {
    dockToggled,
    handleDockedToggle,
    silenceOsNotifications,
    handleToggleSilenceOsNotifications,
  } = useBootstrapping();

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

  /// Handle clicking the docked button.
  const handleDocked = () => {
    handleDockedToggle();

    // Post message to settings window to update switch.
    RendererConfig.portToSettings.postMessage({
      task: 'settings:set:dockedWindow',
      data: {
        docked: !dockToggled,
      },
    });
  };

  /// Handle clicking the silence OS notifications button.
  const handleSilenceOsNotifications = () => {
    handleToggleSilenceOsNotifications();

    // Post message to settings window to update switch.
    RendererConfig.portToSettings.postMessage({
      task: 'settings:set:silenceOsNotifications',
      data: {
        silenced: !silenceOsNotifications,
      },
    });
  };

  return (
    <>
      {menuOpenRef.current ? (
        <button type="button" onClick={() => toggleMenu(false)}>
          <FontAwesomeIcon icon={faCog} transform="grow-1" />
        </button>
      ) : null}
      {!menuOpenRef.current ? (
        <button type="button" onClick={() => toggleMenu(true)}>
          <FontAwesomeIcon icon={faCog} transform="grow-1" />
        </button>
      ) : null}
      {menuOpen ? (
        <MenuWrapper ref={alerterRf}>
          <button
            type="button"
            onClick={() => {
              window.myAPI.openWindow('import');
              toggleMenu(false);
            }}
          >
            Manage Accounts
          </button>
          <button
            type="button"
            onClick={() => {
              window.myAPI.openWindow('settings');
              toggleMenu(false);
            }}
          >
            Settings
          </button>

          {/* Exit */}
          <button
            type="button"
            onClick={async () => await window.myAPI.quitApp()}
            className="separator"
          >
            Exit
          </button>

          {/* Controls */}
          <section className="controls" style={{ width: '100%' }}>
            <div className="controls-wrapper">
              {/* Dock window */}
              <ButtonSecondary
                className="dock-btn"
                text={dockToggled ? 'Detach' : 'Dock'}
                iconLeft={dockToggled ? faUnlock : faLock}
                iconTransform="shrink-5"
                onClick={() => handleDocked()}
              />

              {/* Silence notifications */}
              <ButtonSecondary
                className="dock-btn"
                text={silenceOsNotifications ? 'Unsilence' : 'Silence'}
                iconLeft={silenceOsNotifications ? faBellSlash : faBell}
                iconTransform="shrink-3"
                onClick={() => handleSilenceOsNotifications()}
              />
            </div>
          </section>
        </MenuWrapper>
      ) : null}
    </>
  );
};
