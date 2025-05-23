// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Select from '@radix-ui/react-select';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

/**
 * Select Trigger
 */
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
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: start;
  border-radius: 0.375rem;
  padding: 1.1rem 1.25rem;
  font-size: 1.1rem;
  gap: 1rem;

  /** Same class as select item */
  .innerRow {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    align-items: center;

    > div:first-of-type {
      min-width: 30px;
    }
  }

  /* SelectIcon */
  .SelectIcon {
    flex: 1;
    text-align: right;
  }
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
  /* Disabled */
  &[data-disabled] {
    cursor: not-allowed;
    span {
      opacity: 0.4;
    }
    &:hover {
      background-color: var(--background);
    }
  }
`;

/**
 * Select Content
 */
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
    font-size: 1.1rem;
    line-height: 1rem;
    border-radius: 0.375rem;
    user-select: none;

    .innerRow {
      display: flex;
      flex-direction: row;
      gap: 0.75rem;
      align-items: center;

      > div:first-of-type {
        min-width: 30px;
      }
    }

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
    opacity: 0.6;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    cursor: default;
  }
`;
