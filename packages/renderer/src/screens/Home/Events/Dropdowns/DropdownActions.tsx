// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as themeVariables from '@ren/theme/variables';
import { useBootstrapping } from '@ren/contexts/main/Bootstrapping';
import { useConnections } from '@ren/contexts/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faFileContract,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { MenuButton } from '@ren/screens/OpenGov/Dropdowns/Wrappers';
import { DropdownMenuContent } from '@polkadot-live/ui/styles';
import type { EventAccountData } from '@polkadot-live/types/reporter';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { ActionsDropdownProps } from './types';

export const ActionsDropdown = ({
  event,
  txActions,
  uriActions,
}: ActionsDropdownProps) => {
  const { isConnecting } = useBootstrapping();
  const { darkMode, isBuildingExtrinsic, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  // Extract account source from event.
  const source: AccountSource | null =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).source
      : null;

  // Open action window and initialize with the event's tx data.
  const openActionWindow = async (txMeta: ActionMeta, btnLabel: string) => {
    // Relay building extrinsic flag to app.
    window.myAPI.relaySharedState('isBuildingExtrinsic', true);

    const extrinsicsViewOpen = await window.myAPI.isViewOpen('action');
    if (!extrinsicsViewOpen) {
      // Relay init task to extrinsics window after its DOM has loaded.
      window.myAPI.openWindow('action', {
        windowId: 'action',
        task: 'action:init',
        serData: JSON.stringify(txMeta),
      });

      // Analytics.
      window.myAPI.umamiEvent('window-open-extrinsics', {
        action: `${event.category}-${btnLabel?.toLowerCase()}`,
      });
    } else {
      window.myAPI.openWindow('action');

      // Send init task directly to extrinsics window if it's already open.
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:init',
        data: JSON.stringify(txMeta),
      });
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <MenuButton
          style={{
            width: '31px',
            height: '16px',
            backgroundColor: 'var(--button-background-secondary)',
          }}
          $dark={darkMode}
          aria-label="Referendum Actions"
        >
          <div>
            <FontAwesomeIcon
              className="icon"
              icon={faCaretDown}
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
                !(['read-only', 'ledger'] as AccountSource[]).includes(
                  source
                ) &&
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
                        icon={faFileContract}
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
                  onSelect={() => {
                    window.myAPI.openBrowserURL(uri);
                    window.myAPI.umamiEvent('link-open', {
                      dest: label.toLowerCase(),
                    });
                  }}
                >
                  <div className="LeftSlot">
                    <FontAwesomeIcon
                      icon={faUpRightFromSquare}
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
