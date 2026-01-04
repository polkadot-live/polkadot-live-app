// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Style from '@polkadot-live/styles';
import * as Toggle from '@radix-ui/react-toggle';
import styled from 'styled-components';
import type { darkTheme } from '@polkadot-live/styles';

export const ActionBtn = styled.button.attrs<{ $theme: typeof darkTheme }>(
  (props) => ({
    $theme: props.$theme,
  })
)`
  color: ${({ $theme }) => $theme.textColorSecondary};
  background-color: ${({ $theme }) => $theme.buttonBackgroundPrimary};
  border-color: ${({ $theme }) => $theme.buttonBackgroundPrimary};
  border-radius: 0.15rem;
  min-width: 4.5rem;
  min-height: 22.52px;
  width: 4.5rem;
  padding: 0.45rem 0.2rem;
  font-size: 0.85rem;
  transition: all 150ms ease-out;

  &:hover:not(:disabled) {
    background-color: ${({ $theme }) => $theme.buttonBackgroundPrimaryHover};
  }
`;

export const EncodedAddressesWrapper = styled.div.attrs<{
  $theme: typeof darkTheme;
}>((props) => ({
  $theme: props.$theme,
}))`
  .NetworkRow {
    min-width: 140px;
    .NetworkLabel {
      color: ${({ $theme }) => $theme.textColorSecondary};
      display: inline-block;
      font-size: 1rem;
      opacity: 0.8;
    }
    @media (max-width: 590px) {
      min-width: 0;
      .NetworkLabel {
        display: none;
      }
    }
  }
  /** General */
  .Overflow {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ChainIcon {
    position: absolute;
    top: 7px;
    left: 10px;
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 4px;
    transition: opacity 0.1s ease-out;
  }
  .NetworkIcon {
    min-width: 15px;
    width: 15px;
    height: 15px;
  }
  /** Encoded Address Row */
  .EncodedRow {
    padding: 1rem 1.25rem;
    padding-right: 1rem;
    border-radius: 0.375rem;
    background-color: ${({ $theme }) => $theme.backgroundPrimary};
    min-width: 0;

    .NameAddressRow {
      flex: 1;
      min-width: 0;

      > .EntryArrow {
        color: ${({ $theme }) => $theme.textColorSecondary};
        opacity: 0.35;
      }
      > span:first-of-type {
        color: ${({ $theme }) => $theme.textColorPrimary};
        font-size: 1.1rem;
      }
      > .AddressRow {
        color: ${({ $theme }) => $theme.textColorSecondary};
        font-size: 0.98rem;
        opacity: 0.6;
        min-width: 0;
      }
    }
  }
`;

/**
 * Controls Row.
 */
export const ControlsRow = styled(Style.FlexRow).attrs<{
  $theme: typeof darkTheme;
}>((props) => ({ $theme: props.$theme }))`
  color: ${({ $theme }) => $theme.textColorPrimary};
  padding-bottom: 0.25rem;
  h2 {
    font-size: 1.1rem;
  }
`;

/**
 * Radix-UI toggle button.
 */
export const ToggleRx = styled(Toggle.Root).attrs<{ $theme: typeof darkTheme }>(
  (props) => ({ $theme: props.$theme })
)`
  background-color: ${({ $theme }) => $theme.buttonBackgroundPrimary};
  color: ${({ $theme }) => $theme.textColorPrimary};
  height: 30px;
  width: 30px;
  border-radius: 0.375rem;
  display: flex;
  line-height: 1;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ $theme }) => $theme.buttonBackgroundPrimaryHover};
  }
  &[data-state='on'] {
    //Empty
  }
  &:focus {
    //Empty
  }
`;
