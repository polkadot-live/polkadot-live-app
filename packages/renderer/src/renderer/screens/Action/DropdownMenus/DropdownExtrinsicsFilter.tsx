// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '@ren/renderer/theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';

import { useState } from 'react';
import { useConnections } from '@app/contexts/common/Connections';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownMenuContent } from './Wrappers';

// TMP
import styled from 'styled-components';
import { CheckboxRoot } from '../../Import/Wrappers';
import { CheckIcon } from '@radix-ui/react-icons';
import { FlexRow } from '@polkadot-live/ui/styles';
import { TooltipRx } from '@polkadot-live/ui/components';
import type { AnyData } from '@polkadot-live/types/misc';

const FilterButton = styled.button`
  background-color: var(--background-primary);
  color: var(--text-color-secondary);
  border-radius: 0.375rem;
  align-self: stretch;

  .wrapper {
    display: flex;
    align-self: stretch;
    align-items: center;
    height: 100%;
    justify-content: center;
    padding: 0 1.25rem;
  }
  &:hover {
    color: var(--text-color-primary);
    background-color: var(--background-primary-hover);
  }
`;

interface CheckboxRxProps {
  selected: boolean;
  theme: AnyData;
  onChecked: () => void;
}

const CheckboxRx = ({ selected, theme, onChecked }: CheckboxRxProps) => (
  <CheckboxRoot
    $theme={theme}
    className="CheckboxRoot"
    checked={selected}
    onCheckedChange={() => onChecked()}
  >
    <Checkbox.Indicator className="CheckboxIndicator">
      <CheckIcon />
    </Checkbox.Indicator>
  </CheckboxRoot>
);

interface ExtrinsicFilter {
  label: string;
  selected: boolean;
}

export const DropdownExtrinsicsFilter = () => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const [checkboxState, setCheckboxState] = useState<ExtrinsicFilter[]>([
    {
      label: 'Finalized',
      selected: true,
    },
    {
      label: 'Pending',
      selected: true,
    },
  ]);

  const onToggleFilter = (label: string, selected: boolean) => {
    setCheckboxState((pv) =>
      pv.map((cb) => (cb.label === label ? { ...cb, selected } : cb))
    );
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <FilterButton aria-label="Filter Extrinsics">
          <TooltipRx text={'Filter Status'} theme={theme}>
            <div className="wrapper">
              <FontAwesomeIcon icon={FA.faFilter} transform={'shrink-2'} />
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
          {checkboxState.map(({ label, selected }, i) => (
            <DropdownMenu.Item
              key={`${i}-${label}`}
              className="DropdownMenuItem"
              onSelect={(e) => {
                e.preventDefault();
                onToggleFilter(label, !selected);
              }}
            >
              <FlexRow>
                <CheckboxRx
                  selected={selected}
                  theme={theme}
                  onChecked={() => onToggleFilter(label, !selected)}
                />
                <span>{label}</span>
              </FlexRow>
            </DropdownMenu.Item>
          ))}

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
