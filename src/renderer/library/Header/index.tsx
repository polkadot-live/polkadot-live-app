// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as RendererConfig } from '@/config/processes/renderer';
import { faTimes, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import { Switch } from '../Switch';
import { Tooltip } from 'react-tooltip';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import { useBootstrapping } from '@/renderer/contexts/Bootstrapping';
import { Flip, toast } from 'react-toastify';
import type { HeaderProps } from './types';
import { faLock, faUnlock } from '@fortawesome/pro-solid-svg-icons';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { pathname } = useLocation();
  const {
    online: isOnline,
    isAborting,
    isConnecting,
    setIsAborting,
    setIsConnecting,
    handleInitializeAppOffline,
    handleInitializeAppOnline,
  } = useBootstrapping();

  /// App settings.
  const {
    dockToggled,
    silenceOsNotifications,
    handleDockedToggle,
    handleToggleSilenceOsNotifications,
  } = useBootstrapping();

  /// Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

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
    <HeaderWrapper>
      <div className="content-wrapper">
        <div className="grab" />
        <div className="right">
          {showMenu || activeWindow === 'menu' ? (
            <div className="controls-wrapper">
              {/* Docked button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '1rem',
                }}
              >
                <ButtonSecondary
                  className="dock-btn"
                  text={dockToggled ? 'Detach' : 'Dock'}
                  iconLeft={dockToggled ? faUnlock : faLock}
                  iconTransform="shrink-2"
                  onClick={() => handleDocked()}
                />
              </div>

              {/* Connection button */}
              <div className="connect-wrapper">
                <ButtonSecondary
                  className={
                    (isConnecting && !isAborting) || (appLoading && !isAborting)
                      ? 'connect-btn do-pulse hide-text'
                      : isAborting || isConnecting || appLoading
                        ? 'connect-btn do-pulse'
                        : 'connect-btn'
                  }
                  text={
                    isAborting
                      ? 'Canceling..'
                      : isConnecting || appLoading
                        ? 'Abort'
                        : getConnectionButtonText()
                  }
                  disabled={isAborting}
                  onClick={async () => await handleConnectButtonClick()}
                />
                {((isConnecting && !isAborting) ||
                  (appLoading && !isAborting)) && (
                  <div className="abort-x do-pulse">
                    <FontAwesomeIcon icon={faX} className="icon-sm" />
                  </div>
                )}
              </div>

              {/* Silence OS notifications switch */}
              <a
                data-tooltip-id="silence-notifications-tooltip"
                data-tooltip-content="Silence OS Notifications"
                data-tooltip-place="left"
              >
                <Switch
                  size="sm"
                  type="mono"
                  isOn={silenceOsNotifications}
                  disabled={appLoading}
                  handleToggle={() => handleSilenceOsNotifications()}
                />
              </a>

              {/* Cog menu*/}
              <Menu />
            </div>
          ) : (
            <button
              type="button"
              disabled={appLoading}
              onClick={() => window.myAPI.closeWindow(activeWindow)}
            >
              <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
            </button>
          )}
          <Tooltip id="silence-notifications-tooltip" />
        </div>
      </div>
    </HeaderWrapper>
  );
};
