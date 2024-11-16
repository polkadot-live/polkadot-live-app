// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { Classic } from '@theme-toggles/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUnlock,
  faLock,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';

import { ButtonSecondary } from '../../kits/Buttons';
import { HeaderWrapper } from './Wrapper';
import type { HeaderProps } from './types';

export const Header = ({
  children,
  appLoading = false,
  showButtons = false,
  darkMode,
  dockToggled,
  version,
  onCloseWindow,
  onDockToggle,
  onRestoreWindow,
  onThemeToggle,
}: HeaderProps) => {
  const [toggleState, setToggleState] = useState(Boolean(darkMode));

  return (
    <HeaderWrapper>
      <div className="content-wrapper">
        <div className="grab" />
        <span className="alpha">{version || 'unknown'}</span>
        <div className="right">
          {showButtons ? (
            <div className="controls-wrapper">
              {/* Dock window */}
              <ButtonSecondary
                className="dock-btn"
                text={dockToggled ? 'Detach' : 'Dock'}
                iconLeft={dockToggled ? faUnlock : faLock}
                iconTransform="shrink-5"
                onClick={() => onDockToggle && onDockToggle()}
              />

              {/* Restore base window */}
              <button
                type="button"
                onClick={() => onRestoreWindow && onRestoreWindow()}
              >
                <FontAwesomeIcon
                  transform={'shrink-1'}
                  icon={faWindowRestore}
                />
              </button>

              {/* Theme toggle */}
              <Classic
                toggled={toggleState}
                onToggle={(toggled) => {
                  onThemeToggle && onThemeToggle(toggled);
                  setToggleState(toggled);
                }}
                className="theme-toggle"
                duration={300}
              />

              {/* Children */}
              {children}
            </div>
          ) : (
            <button
              type="button"
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
};
