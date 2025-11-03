// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as FA from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenuContent,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/styles/wrappers';
import { useContextProxy } from '@polkadot-live/contexts';
import { CheckboxRx, TooltipRx } from '@polkadot-live/ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FilterButton } from './Wrappers';

export const DropdownExtrinsicsFilter = () => {
  const { useCtx } = useContextProxy();
  const { getSortedFilterOptions, setFilterOption } = useCtx('TxMetaCtx')();
  const { getTheme } = useCtx('ConnectionsCtx')();
  const theme = getTheme();

  const renderFilterMark = (): boolean =>
    [
      ...getSortedFilterOptions('top'),
      ...getSortedFilterOptions('bottom'),
    ].find(({ selected }) => !selected)
      ? true
      : false;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <FilterButton aria-label="Filter Extrinsics">
          <TooltipRx text={'Filter Status'} theme={theme}>
            <div className="wrapper">
              {renderFilterMark() && (
                <FontAwesomeIcon
                  className="exclaim"
                  icon={FA.faCircleExclamation}
                />
              )}
              <FontAwesomeIcon icon={FA.faFilter} transform={'shrink-0'} />
            </div>
          </TooltipRx>
        </FilterButton>
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
          <FlexColumn $rowGap={'0.25rem'}>
            {getSortedFilterOptions('top').map(
              ({ filter, label, selected }, i) => (
                <DropdownMenu.Item
                  key={`${i}-${filter}`}
                  className="DropdownMenuItem"
                  onSelect={(e) => {
                    e.preventDefault();
                    setFilterOption(filter, !selected);
                  }}
                >
                  <FlexRow>
                    <CheckboxRx
                      selected={selected}
                      theme={theme}
                      onChecked={() => setFilterOption(filter, !selected)}
                    />
                    <span>{label}</span>
                  </FlexRow>
                </DropdownMenu.Item>
              )
            )}
          </FlexColumn>

          <DropdownMenu.Separator className="DropdownMenuSeparator" />

          <DropdownMenu.Label className="DropdownMenuLabel">
            In Progress
          </DropdownMenu.Label>
          <FlexColumn $rowGap={'0.25rem'}>
            {getSortedFilterOptions('bottom').map(
              ({ filter, label, selected }, i) => (
                <DropdownMenu.Item
                  key={`${i}-${filter}`}
                  className="DropdownMenuItem"
                  onSelect={(e) => {
                    e.preventDefault();
                    setFilterOption(filter, !selected);
                  }}
                >
                  <FlexRow>
                    <CheckboxRx
                      selected={selected}
                      theme={theme}
                      onChecked={() => setFilterOption(filter, !selected)}
                    />
                    <span>{label}</span>
                  </FlexRow>
                </DropdownMenu.Item>
              )
            )}
          </FlexColumn>

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
