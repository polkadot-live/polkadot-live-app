// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useConnections, useReferenda } from '@polkadot-live/contexts';
import * as Styles from '@polkadot-live/styles';
import { CheckboxRx, TooltipRx } from '@polkadot-live/ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { DropdownReferendaFilterProps } from './types';

export const DropdownReferendaFilter = ({
  tab,
}: DropdownReferendaFilterProps) => {
  const { getSortedFilterOptions, setFilterOption } = useReferenda();
  const { getTheme } = useConnections();
  const theme = getTheme();

  const renderFilterMark = (): boolean =>
    !!getSortedFilterOptions(tab).find(({ selected }) => !selected);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <span>
          <TooltipRx text={'Filter Referenda'} theme={theme}>
            <button
              type="button"
              className="btn"
              style={{ position: 'relative' }}
              aria-label="Filter Referenda"
            >
              {renderFilterMark() && (
                <FontAwesomeIcon
                  className="exclaim"
                  icon={FA.faCircleExclamation}
                />
              )}
              <FontAwesomeIcon icon={FA.faFilter} transform={'shrink-2'} />
            </button>
          </TooltipRx>
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <Styles.DropdownMenuContent
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
                  onSelect={(e) => {
                    e.preventDefault();
                    setFilterOption(tab, filter, !selected);
                  }}
                >
                  <Styles.FlexRow>
                    <CheckboxRx
                      selected={selected}
                      theme={theme}
                      onChecked={() => {
                        setFilterOption(tab, filter, !selected);
                      }}
                    />
                    <span>{label}</span>
                  </Styles.FlexRow>
                </DropdownMenu.Item>
              ),
            )}
          </Styles.FlexColumn>

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </Styles.DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
