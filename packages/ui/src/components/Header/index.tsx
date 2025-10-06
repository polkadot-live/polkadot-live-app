// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCircleChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { HeaderWrapper } from './Wrapper';
import { Padlock } from '../Padlock';
import type { HeaderProps } from './types';

export const Header = ({
  children,
  appLoading,
  showButtons,
  showDock,
  showMinimize,
  dockToggled,
  version,
  onCloseWindow,
  onDockToggle,
  onMinimizeWindow,
  ToggleNode,
}: HeaderProps) => (
  <HeaderWrapper>
    <div className="content-wrapper">
      <div className="grab" />
      <span data-testid="version" className="release">
        {version || 'unknown'}
      </span>
      <div className="right">
        {showButtons ? (
          <div className="controls-wrapper">
            {/* Theme toggle */}
            {ToggleNode}

            {/* Children */}
            {children}

            {/* Minimize button */}
            {Boolean(showMinimize) && (
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

            {/* Dock button */}
            {Boolean(showDock) && (
              <Padlock
                locked={Boolean(dockToggled)}
                onClick={() => onDockToggle && onDockToggle()}
              />
            )}
          </div>
        ) : (
          <button
            style={onCloseWindow ? undefined : { display: 'none' }}
            type="button"
            data-testid="close-btn"
            disabled={Boolean(appLoading)}
            onClick={() => onCloseWindow && onCloseWindow()}
          >
            <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
          </button>
        )}
      </div>
    </div>
  </HeaderWrapper>
);
