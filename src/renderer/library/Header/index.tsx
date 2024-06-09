// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonSecondary } from '@app/kits/Buttons/ButtonSecondary';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faUnlock, faLock } from '@fortawesome/pro-solid-svg-icons';
import { HeaderWrapper } from './Wrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useAppSettings } from '@/renderer/contexts/main/AppSettings';
import { useLocation } from 'react-router-dom';
import type { HeaderProps } from './types';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { pathname } = useLocation();
  const { dockToggled, handleDockedToggle } = useAppSettings();

  /// Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

  /// Handle clicking the docked button.
  const handleDocked = () => {
    handleDockedToggle();

    RendererConfig.portToSettings.postMessage({
      task: 'settings:set:dockedWindow',
      data: {
        docked: !dockToggled,
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
              {/* Dock window */}
              <ButtonSecondary
                className="dock-btn"
                text={dockToggled ? 'Detach' : 'Dock'}
                iconLeft={dockToggled ? faUnlock : faLock}
                iconTransform="shrink-5"
                onClick={() => handleDocked()}
              />

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
        </div>
      </div>
    </HeaderWrapper>
  );
};
