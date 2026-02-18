// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCircleChevronDown,
  faTags,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FlexRow } from '@polkadot-live/styles';
import { Padlock } from '../Padlock';
import { TooltipRx } from '../TooltipRx';
import { HeaderWrapper } from './Wrapper';
import type { HeaderProps } from './types';

export const Header = ({
  theme,
  children,
  appLoading,
  showButtons,
  showDock,
  showMinimize,
  dockToggled,
  version,
  onCloseWindow,
  onDockToggle,
  onClickTag,
  onMinimizeWindow,
  ToggleNode,
}: HeaderProps) => (
  <HeaderWrapper>
    <div className="content-wrapper">
      <div className="grab" />
      <FlexRow data-testid="version" $gap="0.75rem" className="release">
        <span>{version || 'unknown'}</span>
        {onClickTag && (
          <button
            type="button"
            className="LatestRelease"
            onClick={() => onClickTag()}
          >
            <TooltipRx
              style={{ zIndex: 25 }}
              text={'Check Latest Release'}
              theme={theme}
              side="bottom"
            >
              <FontAwesomeIcon icon={faTags} />
            </TooltipRx>
          </button>
        )}
      </FlexRow>
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
                onClick={() => onMinimizeWindow?.()}
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
                onClick={() => onDockToggle?.()}
              />
            )}
          </div>
        ) : (
          <button
            style={onCloseWindow ? undefined : { display: 'none' }}
            type="button"
            data-testid="close-btn"
            disabled={Boolean(appLoading)}
            onClick={() => onCloseWindow?.()}
          >
            <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
          </button>
        )}
      </div>
    </div>
  </HeaderWrapper>
);
