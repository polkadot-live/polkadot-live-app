// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useConnections } from '@ren/contexts/common';
import { useRenameHandler } from '@ren/contexts/import';
import { ActionBtn } from '../Dialogs/Wrappers';
import { DropdownMenuContent } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretRight,
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EncodedAccount } from '@polkadot-live/types/accounts';

interface DropdownAccountProps {
  encodedAccount: EncodedAccount;
  onBookmarkToggle: (encodedAccount: EncodedAccount) => Promise<void>;
}

const SubscanChainIdMap = new Map<ChainID, string>([
  ['Polkadot', 'polkadot'],
  ['Polkadot Asset Hub', 'assethub-polkadot'],
  ['Polkadot People', 'people-polkadot'],
  ['Kusama', 'kusama'],
  ['Kusama Asset Hub', 'assethub-kusama'],
  ['Kusama People', 'people-kusama'],
  ['Westend', 'westend'],
  ['Westend Asset Hub', 'assethub-westend'],
  ['Westend People', 'people-westend'],
]);

/**
 * Dropdown menu component for import window encoded account listings.
 */
export const DropdownAccount = ({
  encodedAccount,
  onBookmarkToggle,
}: DropdownAccountProps) => {
  const { address, chainId, isBookmarked } = encodedAccount;

  const { isShowAddressDialogOpen, setIsShowAddressDialogOpen } =
    useRenameHandler();

  const { getTheme } = useConnections();
  const theme = getTheme();

  const onBlockExplorerClick = () => {
    const subscanChainId = SubscanChainIdMap.get(chainId)!;
    const uri = `https://${subscanChainId}.subscan.io/account/${address}`;
    window.myAPI.openBrowserURL(uri);
    window.myAPI.umamiEvent('link-open', { dest: 'subsquare' });
  };

  const onShowAddressClick = () => {
    const key = `${chainId}:${address}`;
    const flag = isShowAddressDialogOpen(key);
    setIsShowAddressDialogOpen(key, !flag);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionBtn $theme={theme}>
          <FontAwesomeIcon icon={faEllipsis} transform={'grow-2'} />
        </ActionBtn>
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
