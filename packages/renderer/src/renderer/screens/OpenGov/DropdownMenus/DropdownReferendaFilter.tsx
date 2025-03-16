// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '@app/theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as Styles from '@polkadot-live/ui/styles';
import { TooltipRx } from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '@app/contexts/openGov/Polkassembly';
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

interface DropdownReferendaFilterProps {
  tab: 'active' | 'history';
}

export const DropdownReferendaFilter = ({
  tab,
}: DropdownReferendaFilterProps) => {
  const { getSortedFilterOptions, setFilterOption } = useReferenda();
  const { fetchingMetadata } = usePolkassembly();
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

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
          avoidCollisions={true}
          sideOffset={5}
          sticky="always"
        >
          <DropdownMenu.Label className="DropdownMenuLabel">
            Status
          </DropdownMenu.Label>
          <Styles.FlexColumn $rowGap={'0.25rem'}>
            {getSortedFilterOptions(tab).map(
              ({ filter, label, selected }, i) => (
                <DropdownMenu.Item
                  key={`${i}-${filter}`}
                  className="DropdownMenuItem"
                  disabled={fetchingMetadata}
                  onSelect={(e) => {
                    if (!fetchingMetadata) {
                      e.preventDefault();
                      setFilterOption(tab, filter, !selected);
                    }
                  }}
                >
                  <Styles.FlexRow>
                    <CheckboxRx
                      selected={selected}
                      theme={theme}
                      onChecked={() => {
                        if (!fetchingMetadata) {
                          setFilterOption(tab, filter, !selected);
                        }
                      }}
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
