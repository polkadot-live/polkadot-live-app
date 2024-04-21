// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import { Switch } from '../Switch';
import { useState } from 'react';
import type { HeaderProps } from './types';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { pathname } = useLocation();
  const [silenceToggle, setSilenceToggle] = useState(false);

  // Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

  return (
    <HeaderWrapper>
      <div />
      <div>
        {showMenu || activeWindow === 'menu' ? (
          <>
            <Switch
              size="sm"
              type="primary"
              isOn={silenceToggle}
              handleToggle={() => setSilenceToggle(!silenceToggle)}
            />
            <Menu />
          </>
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
    </HeaderWrapper>
  );
};
