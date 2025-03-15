// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Checkbox from '@radix-ui/react-checkbox';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const CheckboxRoot = styled(Checkbox.Root).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  background-color: var(--background-surface);
  border: 1px solid var(--border-subtle);
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px var(--black-a7);
  transition: background-color 0.2s ease-out;

  &:disabled {
    filter: brightness(0.9);
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: var(--background-secondary-color);
  }
  .CheckboxIndicator {
    color: var(--violet-11);
  }
`;
