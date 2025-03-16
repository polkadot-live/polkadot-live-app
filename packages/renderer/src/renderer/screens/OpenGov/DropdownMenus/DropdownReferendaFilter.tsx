// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '@app/theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as Styles from '@polkadot-live/ui/styles';
import { TooltipRx } from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckIcon } from '@radix-ui/react-icons';

// TODO: Move to UI library
import { DropdownMenuContent } from '../../Action/DropdownMenus/Wrappers';
import type { CheckboxRxProps } from '../../Action/DropdownMenus/types';

const CheckboxRx = ({ selected, theme, onChecked }: CheckboxRxProps) => (
  <Styles.CheckboxRootSimple
    $theme={theme}
    className="CheckboxRoot"
    checked={selected}
    onCheckedChange={() => onChecked()}
  >
    <Checkbox.Indicator className="CheckboxIndicator">
      <CheckIcon />
    </Checkbox.Indicator>
  </Styles.CheckboxRootSimple>
);

export const DropdownReferendaFilter = () => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const { getSortedFilterOptions, setFilterOption } = useReferenda();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <span>
          <TooltipRx text={'Filter Referenda'} theme={theme}>
            <button className="btn" aria-label="Filter Referenda">
              <FontAwesomeIcon icon={FA.faFilter} transform={'shrink-2'} />
            </button>
          </TooltipRx>
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
          <DropdownMenu.Label className="DropdownMenuLabel">
            Status
          </DropdownMenu.Label>
          <Styles.FlexColumn $rowGap={'0.25rem'}>
            {getSortedFilterOptions('active').map(
              ({ filter, label, selected }, i) => (
                <DropdownMenu.Item
                  key={`${i}-${filter}`}
                  className="DropdownMenuItem"
                  onSelect={(e) => {
                    e.preventDefault();
                    setFilterOption(filter, !selected);
                  }}
                >
                  <Styles.FlexRow>
                    <CheckboxRx
                      selected={selected}
                      theme={theme}
                      onChecked={() => setFilterOption(filter, !selected)}
                    />
                    <span>{label}</span>
                  </Styles.FlexRow>
                </DropdownMenu.Item>
              )
            )}
          </Styles.FlexColumn>

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
