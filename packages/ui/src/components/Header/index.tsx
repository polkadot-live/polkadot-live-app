// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUnlock,
  faLock,
  faWindowRestore,
  faCircleChevronDown,
} from '@fortawesome/free-solid-svg-icons';

import { ButtonSecondary } from '../../kits/Buttons';
import { HeaderWrapper } from './Wrapper';
import type { HeaderProps } from './types';

export const Header = ({
  children,
  appLoading = false,
  showButtons = false,
  showDock = true,
  showMinimize = false,
  dockToggled,
  version,
  onCloseWindow,
  onDockToggle,
  onMinimizeWindow,
  onRestoreWindow,
  ToggleNode,
}: HeaderProps) => (
  <HeaderWrapper>
    <div className="content-wrapper">
      <div className="grab" />
      <span data-testid="version" className="alpha">
        {version || 'unknown'}
      </span>
      <div className="right">
        {showButtons ? (
          <div className="controls-wrapper">
            {/* Dock window */}
            {showDock && (
              <ButtonSecondary
                className="dock-btn"
                text={dockToggled ? 'Detach' : 'Dock'}
                iconLeft={dockToggled ? faUnlock : faLock}
                iconTransform="shrink-5"
                onClick={() => onDockToggle && onDockToggle()}
              />
            )}

            {/* Restore base window */}
            <button
              type="button"
              data-testid="restore-btn"
              onClick={() => onRestoreWindow && onRestoreWindow()}
            >
              <FontAwesomeIcon transform={'shrink-1'} icon={faWindowRestore} />
            </button>

            {/* Theme toggle */}
            {ToggleNode}

            {/* Children */}
            {children}

            {/* Minimize button */}
            {showMinimize && (
              <button
                type="button"
                data-testid="minimize-btn"
                onClick={() => onMinimizeWindow && onMinimizeWindow()}
              >
                <FontAwesomeIcon
                  style={{ paddingLeft: '0.25rem' }}
                  transform={'shrink-0'}
                  icon={faCircleChevronDown}
                />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            data-testid="close-btn"
            disabled={appLoading}
            onClick={() => onCloseWindow && onCloseWindow()}
          >
            <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
          </button>
        )}
      </div>
    </div>
  </HeaderWrapper>
);
