// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useChainEvents,
  useConnections,
  useIntervalTasksManager,
} from '@polkadot-live/contexts';
import { DropdownMenuContent } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getPolkassemblySubdomain,
  getSubsquareSubdomain,
} from '@polkadot-live/consts/chains';
import {
  faCaretRight,
  faEllipsis,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';

interface DropdownRefProps {
  refId: number;
}

export const DropdownRef = ({ refId }: DropdownRefProps) => {
  const { getTheme, openInBrowser } = useConnections();
  const { setIsRemoveRefDialogOpen, setRefIdToRemove } =
    useIntervalTasksManager();

  const { activeRefChain } = useChainEvents();
  const theme = getTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <span>
          <button
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
              setRefIdToRemove(refId);
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
              if (activeRefChain) {
                const subdomain = getSubsquareSubdomain(activeRefChain);
                const uri = `https://${subdomain}.subsquare.io/referenda/${refId}`;
                openInBrowser(uri);
              }
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
              if (activeRefChain) {
                const subdomain = getPolkassemblySubdomain(activeRefChain);
                const uri = `https://${subdomain}.polkassembly.io/referenda/${refId}`;
                openInBrowser(uri);
              }
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
