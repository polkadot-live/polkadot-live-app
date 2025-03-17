// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { CheckboxRootSimple } from '../../styles';
import type { CheckboxRxProps } from './types';

export const CheckboxRx = ({ selected, theme, onChecked }: CheckboxRxProps) => (
  <CheckboxRootSimple
    $theme={theme}
    className="CheckboxRoot"
    checked={selected}
    onCheckedChange={() => onChecked()}
  >
    <Checkbox.Indicator className="CheckboxIndicator">
      <CheckIcon />
    </Checkbox.Indicator>
  </CheckboxRootSimple>
);
