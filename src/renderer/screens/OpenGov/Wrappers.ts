// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Scrollable = styled.div`
  width: 100%;
  max-height: 100vh;
  overflow-y: auto;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #212121;
  }
`;

export const TrackGroup = styled.div`
  --container-border-radius: 1.25rem;

  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  border-radius: var(--container-border-radius);
  border: 1px solid var(--border-mid-color);

  > div {
    border-bottom: 2px solid var(--background-default);
  }
  > div:first-of-type {
    border-top-right-radius: var(--container-border-radius);
    border-top-left-radius: var(--container-border-radius);
  }
  > div:last-of-type {
    border-bottom-right-radius: var(--container-border-radius);
    border-bottom-left-radius: var(--container-border-radius);
    border-bottom: none;
  }
`;

export const TrackItem = styled(motion.div)`
  position: relative;
  padding: 1rem 1.25rem;
  background-color: var(--background-primary);
  transition: background-color 0.2s ease-out;

  // Utility.
  .mw-45 {
    min-width: 45px;
  }

  &:hover {
    background-color: #121212;
  }

  /* Top section */
  .stat-wrapper {
    display: flex;
    column-gap: 1rem;
    align-items: center;
    min-width: 90px;

    // Stat text.
    h4 {
      flex: 1;
      font-size: 1.1em;
    }
    // Stat label.
    span {
      padding: 0.5rem;
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.5rem;
      font-size: 0.8rem;
    }
  }

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
      align-items: center;
      column-gap: 1rem;

      > span:first-of-type {
        min-width: 100px;
        opacity: 0.8;
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
  .expand-btn-wrapper {
    display: flex;
    align-items: center;
    background-color: #953254;
    border-radius: 0.5rem;
    opacity: 0.5;
    transition: opacity 0.1s ease-out;
    cursor: pointer;
    padding-left: 0.75rem;

    h4 {
      font-size: 0.9rem;
    }

    &:hover {
      opacity: 0.75;
    }
    .expand-btn {
      position: relative;
      width: 2rem;
      height: 2rem;
      padding: 0;

      svg {
        position: absolute;
        top: 5px;
        left: 6px;
      }
    }
  }
`;
