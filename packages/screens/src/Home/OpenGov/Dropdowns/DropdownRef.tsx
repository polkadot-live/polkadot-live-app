// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCaretRight,
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getPolkassemblySubdomain,
  getSubsquareSubdomain,
} from '@polkadot-live/consts/chains';
import {
  useConnections,
  useIntervalTasksManager,
} from '@polkadot-live/contexts';
import { DropdownMenuContent } from '@polkadot-live/styles';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ChainID } from '@polkadot-live/types';

interface DropdownRefProps {
  chainId: ChainID;
  refId: number;
}

export const DropdownRef = ({ chainId, refId }: DropdownRefProps) => {
  const { getTheme, openInBrowser } = useConnections();
  const { setIsRemoveRefDialogOpen, setRemoveRefData } =
    useIntervalTasksManager();

  const theme = getTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <span>
          <button
            type="button"
            className="Dialog__Button"
            style={{ padding: '0.75rem 1rem' }}
          >
            <FontAwesomeIcon icon={faEllipsis} transform={'grow-1'} />
          </button>
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
          {/** Delete */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={async () => {
              setRemoveRefData({ refId, chainId });
              setIsRemoveRefDialogOpen(true);
            }}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={faCaretRight} transform={'shrink-3'} />
            </div>
            <span>{'Delete'}</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="DropdownMenuSeparator" />

          {/** Subsquare */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onClick={() => {
              const subdomain = getSubsquareSubdomain(chainId);
              const uri = `https://${subdomain}.subsquare.io/referenda/${refId}`;
              openInBrowser(uri);
            }}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon
                icon={faUpRightFromSquare}
                transform={'shrink-3'}
              />
            </div>
            <span>Subsquare</span>
          </DropdownMenu.Item>

          {/** Polkassembly */}
          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={() => {
              const subdomain = getPolkassemblySubdomain(chainId);
              const uri = `https://${subdomain}.polkassembly.io/referenda/${refId}`;
              openInBrowser(uri);
            }}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon
                icon={faUpRightFromSquare}
                transform={'shrink-3'}
              />
            </div>
            <span>Polkassembly</span>
          </DropdownMenu.Item>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
