// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const LedgerAddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 1.15rem 1.5rem;

  > .addressInfo {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    > h2 {
      margin: 0;
      padding: 0;
      font-size: 1.1rem;
    }
    > span {
      color: var(--text-color-secondary);
    }
  }

  .imported {
    color: var(--text-color-secondary);
    font-size: 1rem;
  }
`;

export const AddressListFooter = styled.div`
  background-color: var(--background-window) !important;
  display: flex;
  align-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;

  .pageBtn {
    background-color: var(--background-primary);
    padding: 0 1.75rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease-out;

    svg {
      width: 22px;
      height: 22px;
    }
    &:hover:not(:disabled) {
      background-color: var(--background-primary-hover);
    }
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .importBtn {
    flex: 1;
    text-align: right;
    > button {
      background-color: var(--accent-success);
      color: var(--text-bright);
      padding: 0.95rem 1.5rem;
      border-radius: 0.375rem;
      min-width: 225px;
      transition: all 0.2s ease-out;

      &:hover:not(:disabled) {
        filter: brightness(1.2);
      }
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }
`;

export const InfoCard = styled.div`
  background-color: var(--background-surface);
  color: var(--text-color-secondary);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin-top: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.375rem;

  .dismiss {
    color: var(--accent-warning) !important;
    font-size: 0.75rem;
    filter: brightness(0.65);

    &:hover {
      filter: brightness(1);
    }
  }
  .warning {
    color: var(--accent-warning) !important;
    > span:first-of-type {
      flex: 1;
    }
  }

  span {
    display: flex;
    gap: 0.9rem;
    align-items: center;
  }
`;

export const InfoCardStepsWrapper = styled.div`
  background-color: var(--background-surface);
  color: var(--text-color-secondary);

  display: flex;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.375rem;

  > span:first-of-type {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex: 1;
  }
  > div:first-of-type {
    display: flex;
    gap: 0.75rem;
    align-items: center;

    > button {
      color: var(--text-color-secondary);
      font-size: 1.15rem;
      transition: all 0.15s ease-out;

      &:hover:not(:disabled) {
        color: var(--text-color-primary);
      }
      &:disabled {
        color: var(--text-dimmed);
        cursor: not-allowed;
      }
    }

    > span {
      text-align: center;
      min-width: 35px;
    }
  }
`;

export const ConnectButton = styled.button`
  background-color: var(--button-pink-background);
  color: var(--text-bright);
  padding: 0 1.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-out;
  user-select: none;

  &:hover:not(:disabled) {
    filter: brightness(1.2);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

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
  font-size: 1.2rem;
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
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    cursor: default;
  }
`;
