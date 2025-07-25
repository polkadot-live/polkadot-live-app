// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { DropdownMenuContent } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { MenuButton } from './Wrappers';
import { InfoOverlay } from '../Referenda/InfoOverlay';
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
  proposalData,
  referendum,
}: ReferendumDropdownMenuProps) => {
  const { openOverlayWith } = useOverlay();
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

  const onMoreClick = () => {
    if (proposalData !== null) {
      openOverlayWith(<InfoOverlay proposalData={proposalData!} />, 'large');
    }
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

          {/** More */}
          {proposalData !== null && (
            <>
              <DropdownMenu.Separator className="DropdownMenuSeparator" />
              <DropdownMenu.Item
                className="DropdownMenuItem"
                onSelect={() => onMoreClick()}
              >
                <div className="LeftSlot">
                  <FontAwesomeIcon icon={faCircleInfo} transform={'shrink-3'} />
                </div>
                <span>More</span>
              </DropdownMenu.Item>
            </>
          )}

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
