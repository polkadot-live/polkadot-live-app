// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as themeVariables from '@ren/theme/variables';
import * as Icons from '@radix-ui/react-icons';
import {
  DropdownMenuContent,
  DropdownMenuSubContent,
} from '@polkadot-live/ui/styles';
import { useState } from 'react';
import { useConnections } from '@ren/contexts/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from './Wrappers';

/**
 * Dropdown menu demo component showcasing features.
 */
export const DropdownMenuDemo = () => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const [boxOneChecked, setBoxOneChecked] = useState(true);
  const [boxTwoChecked, setBoxTwoChecked] = useState(true);
  const [radioVal, setRadioVal] = useState('radio-val-1');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton aria-label="Extrinsic Actions">
          <FontAwesomeIcon icon={faEllipsis} transform={'grow-10'} />
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
          <DropdownMenu.Label className="DropdownMenuLabel">
            Label 1
          </DropdownMenu.Label>
          <DropdownMenu.Item className="DropdownMenuItem">
            Item 1 <div className="RightSlot">⌘+A</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem">
            Item 2 <div className="RightSlot">⌘+B</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem" disabled>
            Item 3 <div className="RightSlot">⌘+3</div>
          </DropdownMenu.Item>

          {/** Sub Menu */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
              More Items
              <div className="RightSlot">
                <Icons.ChevronRightIcon />
              </div>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenuSubContent
                $theme={theme}
                className="DropdownMenuSubContent"
                sideOffset={2}
                alignOffset={-5}
              >
                <DropdownMenu.Item className="DropdownMenuItem">
                  Sub Item 1 <div className="RightSlot">⌘+4</div>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem">
                  Sub Item 2
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="DropdownMenu.Separator" />
                <DropdownMenu.Item className="DropdownMenuItem">
                  Sub Item 3
                </DropdownMenu.Item>
              </DropdownMenuSubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="DropdownMenu.Separator" />

          {/** Checkbox Items */}
          <DropdownMenu.CheckboxItem
            className="DropdownMenuCheckboxItem"
            checked={boxOneChecked}
            onCheckedChange={setBoxOneChecked}
          >
            <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
              <Icons.CheckIcon />
            </DropdownMenu.ItemIndicator>
            Checkbox 1 <div className="RightSlot">⌘+5</div>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            className="DropdownMenuCheckboxItem"
            checked={boxTwoChecked}
            onCheckedChange={setBoxTwoChecked}
          >
            <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
              <Icons.CheckIcon />
            </DropdownMenu.ItemIndicator>
            Checkbox 2
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Separator className="DropdownMenuSeparator" />

          {/** Labels, Radio Items */}
          <DropdownMenu.Label className="DropdownMenuLabel">
            Label 1
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={radioVal} onValueChange={setRadioVal}>
            <DropdownMenu.RadioItem
              className="DropdownMenuRadioItem"
              value="radio-val-1"
            >
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
                <Icons.DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              Radio Item 1
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem
              className="DropdownMenuRadioItem"
              value="radio-val-2"
            >
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
                <Icons.DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              Radio Item 2
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>

          {/** Arrow */}
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
