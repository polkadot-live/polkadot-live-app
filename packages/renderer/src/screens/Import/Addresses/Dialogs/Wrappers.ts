// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { darkTheme } from '@ren/theme/variables';

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
    padding: 1.15rem 1.25rem;
    padding-right: 1rem;
    background-color: ${({ $theme }) => $theme.backgroundPrimary};

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
      > .NetworkRow {
        flex: 1;
        justify-content: flex-end;

        .NetworkLabel {
          color: ${({ $theme }) => $theme.textColorSecondary};
          display: inline-block;
          font-size: 1rem;
          opacity: 0.8;
          @media (max-width: 590px) {
            display: none;
          }
        }
      }
    }
  }
`;
