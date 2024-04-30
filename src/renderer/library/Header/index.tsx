// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as RendererConfig } from '@/config/processes/renderer';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import { Switch } from '../Switch';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';
import type { HeaderProps } from './types';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import { useOnlineStatus } from '@/renderer/contexts/OnlineStatus';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const { pathname } = useLocation();
  const {
    online: isOnline,
    isAborting,
    setIsAborting,
    handleInitializeAppOffline,
    handleInitializeAppOnline,
  } = useOnlineStatus();
  const [silenceToggle, setSilenceToggle] = useState(
    RendererConfig.silenceNotifications
  );

  // Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

  // Handle toggle to silence all notifications.
  const handleSilenceNotifications = () => {
    const newFlag = !silenceToggle;
    RendererConfig.silenceNotifications = newFlag;
    setSilenceToggle(newFlag);
  };

  // Get text for connection button.
  const getConnectionButtonText = () => {
    if (isConnecting || appLoading) {
      return 'Abort';
    } else if (isOnline) {
      return 'Disconnect';
    } else {
      return 'Connect';
    }
  };

  // Handler for connection button.
  const handleConnectButtonClick = async () => {
    if (isConnecting || appLoading) {
      // Handle abort.
      handleAbortConnecting();
    } else if (isOnline) {
      // Handle going offline.
      await handleInitializeAppOffline();
    } else {
      // Handle going online.
      setIsConnecting(true);
      await handleInitializeAppOnline();
      setIsConnecting(false);
    }
  };

  // Handler for aborting connection processing.
  const handleAbortConnecting = () => {
    setIsAborting(true);
    RendererConfig.abortConnecting = true;
  };

  return (
    <HeaderWrapper>
      <div className="content-wrapper">
        <div className="grab" />
        <div className="right">
          {showMenu || activeWindow === 'menu' ? (
            <div className="switch-wrapper">
              <ButtonSecondary
                className={
                  isAborting || isConnecting || appLoading
                    ? 'connect-btn do-pulse'
                    : 'connect-btn'
                }
                text={
                  isAborting
                    ? 'Aborting...'
                    : isConnecting || appLoading
                      ? 'Abort'
                      : getConnectionButtonText()
                }
                disabled={isAborting}
                onClick={async () => await handleConnectButtonClick()}
              />

              <a
                data-tooltip-id="silence-notifications-tooltip"
                data-tooltip-content="Silence OS Notifications"
                data-tooltip-place="left"
              >
                <Switch
                  size="sm"
                  type="mono"
                  isOn={silenceToggle}
                  disabled={appLoading}
                  handleToggle={() => handleSilenceNotifications()}
                />
              </a>
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
