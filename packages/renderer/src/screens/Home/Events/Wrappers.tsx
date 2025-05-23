// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  row-gap: 0.5rem;
`;

export const NoEventsWrapper = styled.div`
  margin-top: 6.75rem;
  z-index: 1;

  button {
    font-family: InterSemiBold, sans-serif;
    z-index: 1;
    padding: 0.5rem 1.75rem !important;
  }
  h1 {
    text-align: center;
    margin-bottom: 0;
  }
  h3 {
    text-align: center;
    margin: 2rem 0 1rem 0;
    font-size: 1.2rem;
  }
  h5 {
    text-align: center;
    display: flex;
    align-items: center;
    a {
      color: var(--text-color-primary);
    }
  }
  p {
    text-align: center;
    margin: 0.65rem 0;
  }
`;

export const EventGroup = styled.div`
  width: 100%;
  z-index: 2;

  .items-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;

    > div {
      background-color: var(--background-primary);
    }
    > div:first-of-type {
      border-top-left-radius: 0.375rem;
      border-top-right-radius: 0.375rem;
    }
    > div:last-of-type {
      border-bottom-left-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
  }
`;

// Mixin for event item buttons.
const eventBtnBase = css`
  font-size: 1.1rem;
  padding: 0;
  cursor: pointer;

  svg {
    color: var(--text-color-primary);
    opacity: 0.4;
    transition: opacity 0.2s ease-out;
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
`;

export const EventItem = styled(motion.div)`
  --event-item-left-width: 4rem;
  position: relative;

  .DismissBtn {
    ${eventBtnBase}
  }
  .TimeAgoBtn {
    ${eventBtnBase}
  }
  .DividerVertical {
    color: var(--text-dimmed);
    opacity: 0.5;
  }

  // Show actions buttons
  .show-actions-btn {
    ${eventBtnBase}
    top: 4.2rem;
    right: 10px;
  }

  > div {
    width: 100%;
    padding: 1.15rem 1rem;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;

    // All direct divs
    .icon-wrapper {
      padding-left: 0.7rem;
      min-width: fit-content;
      align-self: start;
      padding-top: 0.1rem;
    }
    h4 {
      color: var(--text-color-secondary);
      min-width: fit-content;
      font-size: 1.05rem;
      font-weight: 600;
    }
    h5 {
      color: var(--text-color-secondary);
      font-size: 0.98rem;
      margin: 0.35rem 0;
    }
    p {
      color: var(--text-color-primary);
      margin: 0;
      font-weight: 600;
      font-size: 1.03rem;
    }
  }

  // Actions container
  .actions-wrapper {
    width: 200%;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-items: start;
    overflow: hidden;

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: start;
      column-gap: 1rem;
      // even width for actions contaienrs.
      flex-grow: 1;
      flex-basis: 0;
      margin: 1rem 0 0;
      overflow: hidden;
      padding-left: 4.5rem;

      .btn-mono {
        background-color: var(--button-pink-background);
        border: 1px solid var(--button-pink-background);
        color: var(--button-pink-color);
      }
      .btn-mono-invert {
        border: 1px solid var(--accent-secondary);
        color: var(--accent-secondary);
      }
      button {
        font-size: 0.95rem;
        padding-top: 0.25rem;
      }
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`;
