// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useConnections, useTabs } from '@polkadot-live/contexts';
import * as Styles from '@polkadot-live/styles';
import { TooltipRx } from '@polkadot-live/ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { TriggerBtn } from './Wrappers';

const MenuItem = ({ label, viewId }: { label: string; viewId: string }) => {
  const { openTabFromMenu } = useTabs();
  return (
    <DropdownMenu.Item
      className="DropdownMenuItem"
      onSelect={async () => openTabFromMenu({ id: -1, label, viewId })}
    >
      <Styles.FlexRow style={{ padding: '0 0.5rem' }}>
        <FontAwesomeIcon icon={FA.faCaretRight} transform={'shrink-4'} />
        <span>{label}</span>
      </Styles.FlexRow>
    </DropdownMenu.Item>
  );
};

export const DropdownOpenTabs = () => {
  const { getTheme } = useConnections();
  const theme = getTheme();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <span>
          <TooltipRx side="bottom" text={'Open Tab'} theme={theme}>
            <TriggerBtn style={{ position: 'relative' }} aria-label="Open Tab">
              <FontAwesomeIcon icon={FA.faPlus} transform={'shrink-2'} />
            </TriggerBtn>
          </TooltipRx>
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <Styles.DropdownMenuContent
          $theme={theme}
          align="center"
          side="bottom"
          avoidCollisions={true}
          sideOffset={5}
          sticky="always"
        >
          <Styles.FlexColumn $rowGap={'0.25rem'}>
            <MenuItem label="Accounts" viewId="import" />
            <MenuItem label="Extrinsics" viewId="action" />
            <MenuItem label="OpenGov" viewId="openGov" />
            <MenuItem label="Settings" viewId="settings" />
          </Styles.FlexColumn>
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </Styles.DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
