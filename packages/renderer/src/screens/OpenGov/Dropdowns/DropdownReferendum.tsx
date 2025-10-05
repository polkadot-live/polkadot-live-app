// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useConnections } from '@ren/contexts/common';
import { DropdownMenuContent } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { MenuButton } from './Wrappers';
import {
  getPolkassemblySubdomain,
  getSubsquareSubdomain,
} from '@polkadot-live/consts/chains';
import type { ReferendumDropdownMenuProps } from './types';

/**
 * Dropdown menu component for referendum items.
 */
export const ReferendumDropdownMenu = ({
  chainId,
  referendum,
}: ReferendumDropdownMenuProps) => {
  const { cacheGet, getTheme } = useConnections();
  const darkMode = cacheGet('mode:dark');
  const theme = getTheme();

  const onPolkassemblyClick = () => {
    const { refId } = referendum;
    const uriPolkassembly = `https://${getPolkassemblySubdomain(chainId)}.polkassembly.io/referenda/${refId}`;
    window.myAPI.openBrowserURL(uriPolkassembly);
    window.myAPI.umamiEvent('link-open', {
      dest: 'polkassembly',
    });
  };

  const onSubsquareClick = () => {
    const { refId } = referendum;
    const uriSubsquare = `https://${getSubsquareSubdomain(chainId)}.subsquare.io/referenda/${refId}`;
    window.myAPI.openBrowserURL(uriSubsquare);
    window.myAPI.umamiEvent('link-open', { dest: 'subsquare' });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <MenuButton $dark={darkMode} aria-label="Referendum Actions">
          <div>
            <FontAwesomeIcon
              className="icon"
              icon={faEllipsis}
              transform={'grow-3'}
            />
          </div>
        </MenuButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenuContent
          $theme={theme}
          align="end"
          side="bottom"
          avoidCollisions={false}
          sideOffset={5}
        >
          {/** Subsquare */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={() => onSubsquareClick()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon
                icon={faUpRightFromSquare}
                transform={'shrink-3'}
              />
            </div>
            <span>SubSquare</span>
          </DropdownMenu.Item>

          {/** Polkassembly */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={() => onPolkassemblyClick()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon
                icon={faUpRightFromSquare}
                transform={'shrink-3'}
              />
            </div>
            <span>Polkassembly</span>
          </DropdownMenu.Item>

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
