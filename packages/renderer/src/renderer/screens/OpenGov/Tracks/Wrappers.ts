// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { mixinHelpIcon } from '@ren/renderer/library/components/Common';

export const StickyHeadings = styled.div`
  background-color: var(--background-window);
  position: sticky;
  top: -1.5rem;
  z-index: 15;

  .content-wrapper {
    display: flex;
    column-gap: 1rem;
    align-items: center;

    div {
      padding: 0.4rem 0 0.4rem;
    }
    .left {
      flex: 1;
      display: flex;
      align-items: center;
      column-gap: 1rem;

      div:nth-child(1) {
        min-width: 58px;
        padding-left: 22px;
      }
      div:nth-child(2) {
        min-width: 40px;
      }
    }

    .right {
      justify-content: start;
      display: flex;
      align-items: center;
      column-gap: 1rem;

      div:nth-child(1) {
        min-width: 154px;
      }
      div:nth-child(2) {
        min-width: 140px;
      }
      div:nth-child(3) {
        min-width: 90px;
      }
    }
  }

  .heading {
    color: var(--text-color-secondary);
    font-size: 1rem;
    font-weight: 500;
    opacity: 0.6;
    transition: opacity 0.2s ease-out;
    cursor: default;

    &:hover {
      opacity: 0.8;
    }
  }
`;

export const TrackItem = styled(motion.div)`
  background-color: var(--background-primary);
  position: relative;
  padding: 1rem 1.25rem;
  transition: background-color 0.2s ease-out;

  // Utility.
  .mw-84 {
    min-width: 84px;
  }
  .mw-45 {
    min-width: 45px;
  }
  .mw-20 {
    min-width: 18px;
  }

  /* Content */
  .content-wrapper {
    display: flex;
    align-items: center;
    column-gap: 1rem;

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }
    .right {
      justify-content: start;
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }
  }

  /* Stats */
  .stat-wrapper {
    display: flex;
    column-gap: 1.5rem;
    min-width: 90px;
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

    .titleWrapper {
      display: flex;
      gap: 0.5rem;
      align-items: center;
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
