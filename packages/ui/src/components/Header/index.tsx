// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import { Config as RendererConfig } from '@ren/config/processes/renderer';
import {
  faTimes,
  faUnlock,
  faLock,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';
import { HeaderWrapper } from './Wrapper';
import { Classic } from '@theme-toggles/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '../../components';
import { useAppSettings } from '@ren/renderer/contexts/main/AppSettings';
import { useConnections } from '@ren/renderer/contexts/common/Connections';
import { version } from '../../../package.json';
import type { HeaderProps } from './types';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { darkMode, setDarkMode } = useConnections();
  const { dockToggled, handleDockedToggle } = useAppSettings();
  const windowId = window.myAPI.getWindowId();

  /// Handle clicking the docked button.
  const handleDocked = () => {
    handleDockedToggle();

    RendererConfig.portToSettings?.postMessage({
      task: 'settings:set:dockedWindow',
      data: {
        docked: !dockToggled,
      },
    });

    // Analytics.
    const event = `setting-toggle-${!dockToggled ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { setting: 'dock-window' });
  };

  return (
    <HeaderWrapper>
      <div className="content-wrapper">
        <div className="grab" />
        <span className="alpha">{version}</span>
        <div className="right">
          {showMenu || windowId === 'main' ? (
            <div className="controls-wrapper">
              {/* Dock window */}
              <ButtonSecondary
                className="dock-btn"
                text={dockToggled ? 'Detach' : 'Dock'}
                iconLeft={dockToggled ? faUnlock : faLock}
                iconTransform="shrink-5"
                onClick={() => handleDocked()}
              />

              {/* Restore base window */}
              <button
                type="button"
                onClick={() => window.myAPI.restoreWindow('base')}
              >
                <FontAwesomeIcon
                  transform={'shrink-1'}
                  icon={faWindowRestore}
                />
              </button>

              {/* Theme toggle */}
              <Classic
                toggled={darkMode}
                toggle={setDarkMode}
                onToggle={(toggled: boolean) => {
                  // Persist new setting to store and broadcast to open windows.
                  window.myAPI.relayModeFlag('darkMode', toggled);
                }}
                className="theme-toggle"
                duration={300}
              />

              {/* Cog menu*/}
              <Menu />
            </div>
          ) : (
            <button
              type="button"
              disabled={appLoading}
              onClick={() => window.myAPI.closeWindow(windowId)}
            >
              <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
            </button>
          )}
        </div>
      </div>
    </HeaderWrapper>
  );
};
