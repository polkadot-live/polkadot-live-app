// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import { ButtonSecondary } from '@app/kits/Buttons/ButtonSecondary';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { faUnlock, faLock } from '@fortawesome/pro-solid-svg-icons';
import type { HeaderProps } from './types';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { pathname } = useLocation();

  /// Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

  const { dockToggled, handleDockedToggle } = useBootstrapping();

  const handleGet = async () => {
    const serialized = await window.myAPI.getPersistedIntervalTasks();
    const tasks: IntervalSubscription[] = JSON.parse(serialized);
    tasks.forEach((t) => console.log(t));
  };

  const handleClear = async () => {
    const result = await window.myAPI.clearPersistedIntervalTasks();
    console.log(result);
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

              <button onClick={async () => await handleGet()}>Get</button>
              <button onClick={async () => await handleClear()}>Clear</button>

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
