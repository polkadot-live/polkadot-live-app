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

type ConnectionStatus = 'app:loading' | 'app:online' | 'app:offline';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { pathname } = useLocation();
  const {
    online: isOnline,
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

  // Utility to get connection status as a type.
  const getConnectionStatus = (): ConnectionStatus =>
    appLoading ? 'app:loading' : isOnline ? 'app:online' : 'app:offline';

  // Get text for connection button.
  const getConnectionButtonText = () => {
    const status = getConnectionStatus();
    switch (status) {
      case 'app:loading':
        return 'Loading';
      case 'app:online':
        return 'Disconnect';
      case 'app:offline':
        return 'Connect';
    }
  };

  // Handler for connection button.
  const handleConnectButtonClick = async () => {
    setIsConnecting(true);
    const status = getConnectionStatus();

    switch (status) {
      case 'app:loading': {
        await handleInitializeAppOffline();
        break;
      }
      case 'app:online': {
        await handleInitializeAppOffline();
        break;
      }
      case 'app:offline': {
        await handleInitializeAppOnline();
        break;
      }
    }
    setIsConnecting(false);
  };

  return (
    <HeaderWrapper>
      <div className="content-wrapper">
        <div className="left">
          <div className="connection-btn-wrapper">
            <ButtonSecondary
              className={isConnecting || appLoading ? 'connecting' : ''}
              style={{
                border: '1px solid var(--border-mid-color)',
                minWidth: '80px',
              }}
              text={getConnectionButtonText()}
              disabled={appLoading || isConnecting}
              onClick={async () => await handleConnectButtonClick()}
            />
            {(isConnecting || appLoading) && (
              <div
                style={{ position: 'absolute', left: '15px', top: '10px' }}
                className="lds-ellipsis"
              >
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}
          </div>
        </div>
        <div className="grab" />
        <div className="right">
          {showMenu || activeWindow === 'menu' ? (
            <div className="switch-wrapper">
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
