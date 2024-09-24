// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonSecondary } from '@app/kits/Buttons/ButtonSecondary';
import { Config as RendererConfig } from '@/config/processes/renderer';
import {
  faTimes,
  faUnlock,
  faLock,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';
import { HeaderWrapper } from './Wrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useAppSettings } from '@/renderer/contexts/main/AppSettings';
import type { HeaderProps } from './types';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { dockToggled, handleDockedToggle } = useAppSettings();
  const windowId = window.myAPI.getWindowId();

  /// Handle clicking the docked button.
  const handleDocked = () => {
    handleDockedToggle();

    if (RendererConfig._portToSettings) {
      RendererConfig.portToSettings.postMessage({
        task: 'settings:set:dockedWindow',
        data: {
          docked: !dockToggled,
        },
      });
    }
  };

  return (
    <HeaderWrapper>
      <div className="content-wrapper">
        <div className="grab" />
        <span className="alpha">alpha</span>
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
