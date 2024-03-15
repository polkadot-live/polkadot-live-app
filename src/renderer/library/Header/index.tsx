// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import type { HeaderProps } from './types';
import type { AnyData } from '@/types/misc';

export const Header = ({ showMenu }: HeaderProps) => {
  const { pathname } = useLocation();

  // Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

  // Temporary click handler to open action window.
  const handleOpenActions = () => {
    const data: Record<string, AnyData> = {
      uid: 'dummyuid',
      action: 'nominationPools_pendingRewards_bond',
      chain: 'Polkadot',
      address: '14uUGXgtB8YJpcqz6WpoG8rBJeK2JY1F7cyZyqGPb6HWmGNf',
      data: {
        pendingRewards: 1000000000,
      },
    };

    window.myAPI.openWindow('action', JSON.stringify(data));

    // TODO: Send metadata to `action` window.
  };

  return (
    <HeaderWrapper>
      <div />
      <div>
        {showMenu || activeWindow === 'menu' ? (
          <>
            <button type="button" onClick={() => handleOpenActions()}>
              <FontAwesomeIcon icon={faToggleOn} transform="grow-3" />
            </button>
            <Menu />
          </>
        ) : (
          <button
            type="button"
            onClick={() => window.myAPI.closeWindow(activeWindow)}
          >
            <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
          </button>
        )}
      </div>
    </HeaderWrapper>
  );
};
