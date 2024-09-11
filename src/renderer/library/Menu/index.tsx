// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setStateWithRef } from '@w3ux/utils';
import { useOutsideAlerter } from '@app/library/Hooks/useOutsideAlerter';
import { useRef, useState } from 'react';
import { MenuWrapper, Separator } from './Wrapper';
import { ButtonSecondary } from '@app/kits/Buttons/ButtonSecondary';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useAppSettings } from '@/renderer/contexts/main/AppSettings';
import { useHelp } from '@/renderer/contexts/common/Help';
import {
  faBell,
  faBellSlash,
  faCog,
  faLinkSlash,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { Flip, toast } from 'react-toastify';

export const Menu = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuOpenRef = useRef(menuOpen);

  /// App settings.
  const { silenceOsNotifications, handleToggleSilenceOsNotifications } =
    useAppSettings();

  /// Bootstrapping.
  const {
    online: isOnline,
    appLoading,
    isAborting,
    isConnecting,
    handleInitializeAppOnline,
    handleInitializeAppOffline,
    setIsAborting,
    setIsConnecting,
  } = useBootstrapping();

  const { openHelp } = useHelp();

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
      const status: boolean =
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false;

      if (status) {
        // Handle going online.
        setIsConnecting(true);
        await handleInitializeAppOnline();
        setIsConnecting(false);
      } else {
        // Render error alert.
        toast.error('You are offline.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
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
        <button
          type="button"
          disabled={appLoading}
          onClick={() => !appLoading && toggleMenu(true)}
          style={{ opacity: appLoading ? '0.3' : '1' }}
        >
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
            Accounts
          </button>
          <button
            type="button"
            onClick={() => {
              window.myAPI.openWindow('openGov');
              toggleMenu(false);
            }}
          >
            OpenGov
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

          <Separator style={{ opacity: '0.5' }} />

          <button
            type="button"
            onClick={() => {
              openHelp('help:docs:disclaimer');
              toggleMenu(false);
            }}
          >
            Disclaimer
          </button>

          <button
            type="button"
            onClick={() => {
              openHelp('help:docs:privacy');
              toggleMenu(false);
            }}
          >
            Privacy
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
                  iconLeft={isOnline ? faLinkSlash : faWifi}
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
