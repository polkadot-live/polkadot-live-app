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
  faWifi,
  faWifiSlash,
} from '@fortawesome/pro-solid-svg-icons';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { Flip, toast } from 'react-toastify';

export const Menu = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuOpenRef = useRef(menuOpen);

  /// App settings.
  const {
    online: isOnline,
    appLoading,
    isAborting,
    isConnecting,
    silenceOsNotifications,
    handleToggleSilenceOsNotifications,
    handleInitializeAppOnline,
    handleInitializeAppOffline,
    setIsAborting,
    setIsConnecting,
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

  /// Get text for connection button.
  const getConnectionButtonText = () => {
    if (isConnecting || appLoading) {
      return 'Abort';
    } else if (isOnline) {
      return 'Disconnect';
    } else {
      return 'Connect';
    }
  };

  /// Handler for connection button.
  const handleConnectButtonClick = async () => {
    if (isConnecting || appLoading) {
      // Handle abort.
      handleAbortConnecting();
    } else if (isOnline) {
      // Handle going offline.
      await handleInitializeAppOffline();
    } else {
      // Confirm online connection.
      const status = await window.myAPI.getOnlineStatus();
      if (status) {
        // Handle going online.
        setIsConnecting(true);
        await handleInitializeAppOnline();
        setIsConnecting(false);
      } else {
        // Render error alert.
        toast.error('You are offline.', {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          closeButton: false,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: 'dark',
          transition: Flip,
          toastId: 'toast-connection', // prevent duplicate alerts
        });
      }
    }
  };

  /// Handler for aborting connection processing.
  const handleAbortConnecting = () => {
    setIsAborting(true);
    RendererConfig.abortConnecting = true;
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
              {/* Connection button */}
              <div className="connect-wrapper">
                <ButtonSecondary
                  className={
                    (isConnecting && !isAborting) || (appLoading && !isAborting)
                      ? 'menu-btn do-pulse'
                      : isAborting || isConnecting || appLoading
                        ? 'menu-btn do-pulse'
                        : 'menu-btn'
                  }
                  text={
                    isAborting
                      ? 'Aborting...'
                      : isConnecting || appLoading
                        ? 'Abort'
                        : getConnectionButtonText()
                  }
                  iconLeft={isOnline ? faWifiSlash : faWifi}
                  iconTransform="shrink-4"
                  disabled={isAborting}
                  onClick={async () => await handleConnectButtonClick()}
                />
              </div>

              {/* Silence notifications */}
              <ButtonSecondary
                className="menu-btn"
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
