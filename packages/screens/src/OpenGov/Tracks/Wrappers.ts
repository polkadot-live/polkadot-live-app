// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { mixinHelpIcon } from '@polkadot-live/styles';
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const StickyHeading = styled.h5<{ $padLeft?: string }>`
  color: var(--text-color-secondary);
  padding-left: ${(props) => (props.$padLeft ? props.$padLeft : '0px')};

  flex: 1;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.6;
  transition: opacity 0.2s ease-out;
  cursor: default;

  &:hover {
    opacity: 0.8;
  }
  .IconWrapper {
    padding: 0.2rem 0.5rem;
    margin-top: -1px;
    transition: color 0.2s ease-out;
    cursor: pointer;

    .Icon {
      font-size: 0.8rem;
    }
    &:hover {
      color: var(--text-bright);
    }
  }

  @media (min-width: 570px) and (max-width: 700px) {
    &.SmHide {
      display: none;
    }
  }
  @media (max-width: 569px) {
    &.SmxHide {
      display: none;
    }
  }
`;

export const TrackItem = styled(motion.div)`
  background-color: var(--background-primary);
  position: relative;
  padding: 1rem 1.25rem;
  transition: background-color 0.2s ease-out;

  .TrackRow {
    // Track
    .RowItem:nth-of-type(1) {
      width: 34px;
    }
    .RowItem:nth-of-type(2) {
      flex: 4;
    }
    // Decision Deposit
    .RowItem:nth-of-type(3) {
      flex: 4;
    }
    // Max Deciding
    .RowItem:nth-of-type(4) {
      flex: 3;
    }
    // Timeline
    .RowItem:nth-of-type(5) {
      flex: 2;
    }
  }

  @media (min-width: 570px) and (max-width: 700px) {
    .RowItem {
      &.SmHide {
        display: none;
      }
    }
  }
  @media (max-width: 569px) {
    .RowItem {
      &.SmxHide {
        display: none;
      }
    }
  }

  /* Stats */
  .RowItem {
    display: flex;
    column-gap: 1.5rem;
    display: flex;
    align-items: center;

    .icon-wrapper {
      ${mixinHelpIcon}
      color: var(--text-dimmed);
      font-size: 0.9rem;
      transition: color 150ms ease-out;
      margin-left: -0.25rem;
      margin-bottom: 0.15rem;
      &:hover {
        color: var(--text-highlight) !important;
      }
    }

    // Stat text.
    h4 {
      font-size: 1.1rem;
    }
    // Stat label.
    span {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      column-gap: 0.6rem;
      padding: 0.5rem 0.75rem 0.5rem;
    }
  }

  /* Expandable section */
  .collapse {
    overflow: hidden;

    .periods-wrapper {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 5rem;
      row-gap: 1rem;
      width: 100%;
      margin-top: 1rem;
      padding: 1.25rem 0 1.25rem;

      @media (max-width: 675px) {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
    }

    /* Period stat */
    .period-stat-wrapper {
      display: flex;
      column-gap: 1rem;
      align-items: center;

      > span:first-of-type {
        font-size: 1.05rem;
        display: flex;
        align-items: center;
        column-gap: 0.5rem;
        min-width: 100px;
        opacity: 0.8;

        .icon-wrapper {
          ${mixinHelpIcon}
          color: var(--text-dimmed);
          font-size: 0.9rem;
          transition: color 150ms ease-out;
          margin-left: -0.25rem;
          margin-bottom: 0.15rem;
          &:hover {
            color: var(--text-highlight) !important;
          }
        }
      }
      h4 {
        font-weight: 400;
        font-size: 1rem;
      }
      > span:last-of-type {
        color: var(--text-color-secondary);
        flex: 1;
        opacity: 0.6;
        font-weight: 400;
        font-size: 0.9rem;
      }
    }
  }

  /* Expand button */
  .polkadot-bg {
    background-color: #953254;
  }
  .kusama-bg {
    background-color: rgb(73 55 112);
  }
  .expand-btn-wrapper {
    display: flex;
    align-items: center;
    border-radius: 0.375rem;
    padding-left: 0.75rem;
    opacity: 0.8;
    transition: all 0.1s ease-out;
    cursor: pointer;

    h4 {
      color: var(--text-bright);
      font-size: 0.9rem;
    }
    &:hover {
      opacity: 1;
    }
    .expand-btn {
      position: relative;
      width: 2rem;
      height: 2rem;
      padding: 0;

      svg {
        color: var(--text-bright);
        position: absolute;
        top: 6px;
        left: 6px;
      }
    }
  }
`;
