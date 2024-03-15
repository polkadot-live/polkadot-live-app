// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@/config/ConfigRenderer';
import { faTimes, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import type { ActionMeta } from '@/types/tx';
import type { HeaderProps } from './types';
import { AccountsController } from '@/controller/renderer/AccountsController';

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
    window.myAPI.openWindow('action');

    // Send action metadata to `action` window.
    const account = AccountsController.get(
      'Polkadot',
      '14uUGXgtB8YJpcqz6WpoG8rBJeK2JY1F7cyZyqGPb6HWmGNf'
    );

    if (!account) {
      throw new Error('Account not found.');
    }

    ConfigRenderer.portMainB.postMessage({
      task: 'action:init',
      data: {
        uid: 'dummyuid',
        action: 'nominationPools_pendingRewards_bond',
        chainId: 'Polkadot',
        account: account.flatten(),
        data: {
          pendingRewards: 1000000000,
        },
      } as ActionMeta,
    });
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
