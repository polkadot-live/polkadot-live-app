// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Select from '@radix-ui/react-select';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const SelectTrigger = styled(Select.Trigger).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  --background: ${(props) => props.$theme.backgroundPrimary};
  --background-hover: ${(props) => props.$theme.backgroundPrimaryHover};
  --text-primary: ${(props) => props.$theme.textColorPrimary};
  --text-secondary: ${(props) => props.$theme.textColorSecondary};

  background-color: var(--background);
  color: var(--text-primary);
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: start;
  border-radius: 0.375rem;
  padding: 1rem 1.25rem;
  font-size: 1.2rem;
  min-height: 35px;
  gap: 1rem;

  /* Label */
  :nth-child(1) {
    flex: 1;
    text-align: left;
  }
  /* Icon */
  :nth-child(2) {
    color: var(--text-primary);
  }
  /* Placeholder */
  &[data-placeholder] {
    color: var(--text-secondary);
    user-select: none;
  }
  /* Hover */
  &:hover {
    background-color: var(--background-hover);
  }
`;

export const SelectContent = styled(Select.Content).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  --background: ${(props) => props.$theme.backgroundPrimary};
  --background-hover: ${(props) => props.$theme.backgroundPrimaryHover};
  --text-primary: ${(props) => props.$theme.textColorPrimary};
  --text-secondary: ${(props) => props.$theme.textColorSecondary};

  background-color: var(--background);
  width: var(--radix-select-trigger-width);
  max-height: var(--radix-select-content-available-height);
  overflow: hidden;
  border-radius: 0.375rem;

  .SelectViewport {
    padding: 1rem;
  }
  .SelectItem {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    position: relative;
    padding: 1rem 1.25rem;
    gap: 0.25rem;
    font-size: 1.2rem;
    line-height: 1rem;
    border-radius: 0.375rem;
    user-select: none;

    /* Disabled */
    &[data-disabled] {
      color: var(--text-secondary);
      pointer-events: none;
    }
    /* Highlighted */
    &[data-highlighted] {
      background-color: var(--background-hover);
      outline: none;
    }
    /* Selected Item Indicator */
    .SelectItemIndicator {
      width: 25px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
  .SelectScrollButton {
    background-color: var(--background);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    cursor: default;
  }
`;
