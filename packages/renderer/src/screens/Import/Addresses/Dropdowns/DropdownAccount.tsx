// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useConnections } from '@ren/contexts/common';
import { useRenameHandler } from '@ren/contexts/import';
import { ActionBtn } from '../Dialogs/Wrappers';
import { DropdownMenuContent } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSubscanSubdomain } from '@polkadot-live/consts/chains';
import {
  faCaretRight,
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

interface DropdownAccountProps {
  encodedAccount: EncodedAccount;
  genericAccount: ImportedGenericAccount;
  onBookmarkToggle: (encodedAccount: EncodedAccount) => Promise<void>;
  triggerSize?: 'sm' | 'lg';
}

/**
 * Dropdown menu component for import window encoded account listings.
 */
export const DropdownAccount = ({
  triggerSize = 'sm',
  encodedAccount,
  genericAccount,
  onBookmarkToggle,
}: DropdownAccountProps) => {
  const { address, chainId, isBookmarked } = encodedAccount;

  const { getTheme } = useConnections();
  const { setShowAddressDialogData, setRenameDialogData } = useRenameHandler();
  const theme = getTheme();

  const onBlockExplorerClick = () => {
    const network = getSubscanSubdomain(chainId);
    const uri = `https://${network}.subscan.io/account/${address}`;
    window.myAPI.openBrowserURL(uri);
    window.myAPI.umamiEvent('link-open', { dest: 'subscan' });
  };

  const onShowAddressClick = () => {
    setShowAddressDialogData({ encodedAccount, isOpen: true });
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
