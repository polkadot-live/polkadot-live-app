// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import type { HeaderProps } from './types';
//TMP
import { getUnclaimedPayouts } from '@/renderer/callbacks/nominating';
import type { ChainID } from '@/types/chains';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
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

  // Function to calculate an account's unclaimed payouts.
  const doUnclaimedPayouts = async () => {
    const address = '13htYtmALyHWxz6s6zcEnDtwBmtL1Ay54U3i4TEM555HJEhL';
    const chainId = 'Polkadot' as ChainID;

    await getUnclaimedPayouts(address, chainId);
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
              onClick={async () => await doUnclaimedPayouts()}
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
