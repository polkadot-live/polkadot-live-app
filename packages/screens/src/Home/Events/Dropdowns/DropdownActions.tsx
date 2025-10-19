// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { useContextProxy } from '@polkadot-live/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  DropdownMenuContent,
  MenuButton,
} from '@polkadot-live/styles/wrappers';
import type { EventAccountData } from '@polkadot-live/types/reporter';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { ActionsDropdownProps } from './types';

export const ActionsDropdown = ({
  event,
  txActions,
  uriActions,
}: ActionsDropdownProps) => {
  const { useCtx } = useContextProxy();
  const { isConnecting } = useCtx('BootstrappingCtx')();
  const {
    cacheGet,
    getTheme,
    getOnlineMode,
    isTabOpen,
    initExtrinsicMsg,
    openInBrowser,
    openTab,
    relayState,
  } = useCtx('ConnectionsCtx')();
  const darkMode = cacheGet('mode:dark');
  const isBuildingExtrinsic = cacheGet('extrinsic:building');
  const theme = getTheme();

  // Extract account source from event.
  const source: AccountSource | null =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).source
      : null;

  // Open action window and initialize with the event's tx data.
  const openActionWindow = async (txMeta: ActionMeta, btnLabel: string) => {
    relayState('extrinsic:building', true);

    // Relay init task to extrinsics window after its DOM has loaded.
    if (!(await isTabOpen('action'))) {
      const serData = JSON.stringify(txMeta);
      const relayData = { windowId: 'action', task: 'action:init', serData };

      openTab('action', relayData, {
        event: 'window-open-extrinsics',
        data: { action: `${event.category}-${btnLabel?.toLowerCase()}` },
      });
    } else {
      openTab('action');
      initExtrinsicMsg(txMeta);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <MenuButton
          style={{ width: '31px', height: '16px' }}
          $dark={darkMode}
          aria-label="Referendum Actions"
        >
          <div>
            <FontAwesomeIcon
              className="icon"
              icon={FA.faCaretDown}
              transform={'grow-0'}
            />
          </div>
        </MenuButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenuContent
          $theme={theme}
          align="center"
          side="bottom"
          avoidCollisions={true}
          sideOffset={5}
          sticky="always"
        >
          {txActions.length > 0 && (
            <>
              <DropdownMenu.Label className="DropdownMenuLabel">
                Extrinsics
              </DropdownMenu.Label>

              {source &&
                !(['read-only'] as AccountSource[]).includes(source) &&
                txActions.map(({ txMeta, label }, i) => (
                  <DropdownMenu.Item
                    key={`tx_action_${i}`}
                    className="DropdownMenuItem"
                    disabled={
                      isBuildingExtrinsic ||
                      event.stale ||
                      !getOnlineMode() ||
                      (getOnlineMode() && isConnecting)
                    }
                    onSelect={() => {
                      openActionWindow(txMeta, label);
                    }}
                  >
                    <div className="LeftSlot">
                      <FontAwesomeIcon
                        icon={FA.faFileContract}
                        transform={'shrink-3'}
                      />
                    </div>
                    <span>{label}</span>
                  </DropdownMenu.Item>
                ))}
            </>
          )}

          {uriActions.length > 0 && (
            <>
              <DropdownMenu.Label className="DropdownMenuLabel">
                Links
              </DropdownMenu.Label>

              {uriActions.map(({ uri, label }, i) => (
                <DropdownMenu.Item
                  key={`uri_action_${i}`}
                  className="DropdownMenuItem"
                  onSelect={() =>
                    openInBrowser(uri, { dest: label.toLocaleLowerCase() })
                  }
                >
                  <div className="LeftSlot">
                    <FontAwesomeIcon
                      icon={FA.faUpRightFromSquare}
                      transform={'shrink-5'}
                    />
                  </div>
                  <span>{label}</span>
                </DropdownMenu.Item>
              ))}
            </>
          )}

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
