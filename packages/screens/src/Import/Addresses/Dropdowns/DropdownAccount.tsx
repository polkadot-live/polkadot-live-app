// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useContextProxy } from '@polkadot-live/contexts';
import { ActionBtn } from '../Dialogs/Wrappers';
import { DropdownMenuContent } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSubscanSubdomain } from '@polkadot-live/consts/chains';
import {
  faCaretRight,
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import type { DropdownAccountProps } from './types';

/**
 * Dropdown menu component for import window encoded account listings.
 */
export const DropdownAccount = ({
  triggerSize = 'sm',
  encodedAccount,
  genericAccount,
  onBookmarkToggle,
}: DropdownAccountProps) => {
  const { useCtx } = useContextProxy();
  const { address, chainId, isBookmarked } = encodedAccount;
  const { getTheme, openInBrowser } = useCtx('ConnectionsCtx')();
  const { setShowAddressDialogData, setRenameDialogData } =
    useCtx('DialogControlCtx')();
  const theme = getTheme();

  const onBlockExplorerClick = () => {
    const network = getSubscanSubdomain(chainId);
    const uri = `https://${network}.subscan.io/account/${address}`;
    openInBrowser(uri, { dest: 'subscan' });
  };

  const onShowAddressClick = () => {
    setShowAddressDialogData({ address: encodedAccount.address, isOpen: true });
  };

  const onRenameClick = () => {
    setRenameDialogData({ encodedAccount, genericAccount, isOpen: true });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <span>
          {triggerSize === 'sm' && (
            <ActionBtn $theme={theme}>
              <FontAwesomeIcon icon={faEllipsis} transform={'grow-2'} />
            </ActionBtn>
          )}
          {triggerSize === 'lg' && (
            <button className="Dialog__Button">
              <FontAwesomeIcon icon={faEllipsis} transform={'grow-2'} />
            </button>
          )}
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenuContent
          $theme={theme}
          align="end"
          side="bottom"
          avoidCollisions={false}
          sideOffset={5}
        >
          {/** Bookmark */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={async () => await onBookmarkToggle(encodedAccount)}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={faCaretRight} transform={'shrink-3'} />
            </div>
            <span>{isBookmarked ? 'Remove Bookmark' : 'Bookmark'}</span>
          </DropdownMenu.Item>

          {/** Rename Account */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onClick={() => onRenameClick()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={faCaretRight} transform={'shrink-3'} />
            </div>
            <span>Rename</span>
          </DropdownMenu.Item>

          {/** Show Address*/}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onClick={() => onShowAddressClick()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={faCaretRight} transform={'shrink-3'} />
            </div>
            <span>Show Address</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="DropdownMenuSeparator" />

          {/** Explorer*/}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={() => onBlockExplorerClick()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon
                icon={faUpRightFromSquare}
                transform={'shrink-3'}
              />
            </div>
            <span>Block Explorer</span>
          </DropdownMenu.Item>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
