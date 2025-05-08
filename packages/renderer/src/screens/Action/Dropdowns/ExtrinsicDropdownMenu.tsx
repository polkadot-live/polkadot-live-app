// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as themeVariables from '@ren/theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';

import { useState } from 'react';
import { useConnections } from '@ren/contexts/common/Connections';
import { DropdownMenuContent } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton } from './Wrappers';
import { useTxMeta } from '@ren/contexts/action/TxMeta';
import type { ExtrinsicDropdownMenuProps } from './types';

/**
 * Dropdown menu component for extrinsic items.
 */
export const ExtrinsicDropdownMenu = ({
  isBuilt,
  txStatus,
  onSign,
  onMockSign,
  onDelete,
  onSummaryClick,
}: ExtrinsicDropdownMenuProps) => {
  const { showMockUI } = useTxMeta();
  const { darkMode, isBuildingExtrinsic, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const [open, setOpen] = useState<boolean>(false);

  const disableSign = () =>
    !getOnlineMode() ||
    isBuildingExtrinsic ||
    !isBuilt ||
    txStatus !== 'pending';

  return (
    <DropdownMenu.Root open={open} onOpenChange={(val) => setOpen(val)}>
      <DropdownMenu.Trigger asChild>
        <IconButton aria-label="Extrinsic Actions">
          <FontAwesomeIcon icon={FA.faEllipsis} transform={'grow-10'} />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenuContent
          $theme={theme}
          align="end"
          side="bottom"
          avoidCollisions={false}
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="DropdownMenuItem"
            disabled={disableSign()}
            onSelect={() => onSign()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={FA.faGlobe} transform={'shrink-3'} />
            </div>
            <span>Sign</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="DropdownMenuItem"
            onSelect={() => {
              onSummaryClick();
              setOpen(false);
            }}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={FA.faTableList} transform={'shrink-3'} />
            </div>
            <span>Summary</span>
          </DropdownMenu.Item>

          {showMockUI && (
            <DropdownMenu.Item
              className="DropdownMenuItem"
              disabled={disableSign()}
              onSelect={() => onMockSign()}
            >
              <div className="LeftSlot">
                <FontAwesomeIcon icon={FA.faGlobe} transform={'shrink-3'} />
              </div>
              <span>Mock Sign</span>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="DropdownMenuSeparator" />
          <DropdownMenu.Item
            className="DropdownMenuItem"
            disabled={isBuildingExtrinsic}
            onSelect={() => onDelete()}
          >
            <div className="LeftSlot">
              <FontAwesomeIcon icon={FA.faTrash} transform={'shrink-3'} />
            </div>
            <span>Delete</span>
          </DropdownMenu.Item>

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
