// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { faTimes, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import type { ActionMeta } from '@/types/tx';
import type { HeaderProps } from './types';
import { AccountsController } from '@/controller/renderer/AccountsController';

export const Header = ({ showMenu, appLoading }: HeaderProps) => {
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
      'Westend',
      '5HGXNKKQxfkENeE7GjPy3KaAcqYUmMxjzDai5ptYM5cSBJxm'
    );

    if (account) {
      ConfigRenderer.portToAction.postMessage({
        task: 'action:init',
        data: {
          uid: 'dummyuid',
          action: 'nominationPools_pendingRewards_bond',
          balance: JSON.stringify(account.balance),
          pallet: 'nominationPools',
          method: 'bondExtra',
          chainId: 'Westend',
          args: [{ FreeBalance: '10000000000000' }],
          account: account.flatten(),
          // Misc data, currently not used
          data: {
            extra: 10000000000000,
          },
        } as ActionMeta,
      });
    } else {
      console.log('Account not found.');
    }
  };

  return (
    <HeaderWrapper>
      <div />
      <div>
        {showMenu || activeWindow === 'menu' ? (
          <>
            <button
              type="button"
              disabled={appLoading}
              onClick={() => handleOpenActions()}
            >
              <FontAwesomeIcon icon={faToggleOn} transform="grow-3" />
            </button>
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
