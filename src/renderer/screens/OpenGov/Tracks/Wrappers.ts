// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const StickyHeadings = styled.div`
  background-color: var(--background-modal);
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
        min-width: 64px;
        padding-left: 20px;
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
    font-size: 0.92rem;
    color: var(--text-color-secondary);
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
  position: relative;
  padding: 1rem 1.25rem;
  background-color: var(--background-primary);
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

  &:hover {
    background-color: #121212;
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
    column-gap: 1rem;
    min-width: 90px;
    display: flex;
    align-items: center;

    .icon-wrapper {
      font-size: 0.8rem;
      padding-right: 0.8rem;
      padding-left: 0.4rem;
      cursor: pointer;
      opacity: 0.4;
      &:hover {
        color: #953254;
        opacity: 1;
      }
    }

    // Stat text.
    h4 {
      display: flex;
      flex: 1;
      font-size: 1.05rem;
    }
    // Stat label.
    span {
      display: flex;
      align-items: center;
      column-gap: 0.4rem;
      padding: 0.5rem 1rem 0.5rem;
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.5rem;
      font-size: 0.8rem;
      background-color: rgb(17 17 17);
    }
  }

  /* Expandable section */
  .collapse {
    overflow: hidden;

    .periods-wrapper {
      --border-top-bottom: 1px solid #1f1f1f;

      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 5rem;
      row-gap: 1rem;
      width: 100%;
      margin-top: 1rem;
      padding: 1.25rem 0 1.25rem;
      border-top: var(--border-top-bottom);
      border-bottom: var(--border-top-bottom);
      background-color: #111;
    }

    /* Period stat */
    .period-stat-wrapper {
      display: flex;
      column-gap: 1rem;
      align-items: center;

      > span:first-of-type {
        display: flex;
        align-items: center;
        column-gap: 0.5rem;
        min-width: 100px;
        opacity: 0.8;

        .icon-wrapper {
          padding-right: 0.3rem;
          padding-left: 0.25rem;
          font-size: 0.8rem;
          cursor: pointer;
          opacity: 0.4;
          &:hover {
            color: #953254;
            opacity: 1;
          }
        }
      }
      h4 {
        font-weight: 400;
        font-size: 1rem;
      }
      > span:last-of-type {
        flex: 1;
        color: var(--text-color-secondary);
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
    border-radius: 0.5rem;
    padding-left: 0.75rem;
    opacity: 0.8;
    transition: opacity 0.1s ease-out;
    cursor: pointer;

    h4 {
      color: #f1f1f1;
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
        color: #f1f1f1;
        position: absolute;
        top: 5px;
        left: 6px;
      }
    }
  }
`;
