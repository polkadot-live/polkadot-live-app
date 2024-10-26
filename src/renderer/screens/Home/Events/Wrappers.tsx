// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
      background-color: #1c1c1c;
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
  position: absolute;
  width: 2rem;
  height: 2rem;
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

  // Time ago
  > span:first-child {
    text-align: right;
    position: absolute;
    top: 1.25rem;
    right: 44px;
    color: #4d4c4c;
    transition: color ease-out 0.1s;
    cursor: default;
  }
  > span:first-child:hover {
    color: var(--text-color-secondary);
  }

  // Dismiss button
  > .dismiss-btn {
    ${eventBtnBase}
    top: 1rem;
    right: 10px;
  }

  // Time ago button
  > .time-ago-btn {
    ${eventBtnBase}
    top: 3.1rem;
    right: 10px;
  }

  // Show actions buttons
  .show-actions-btn {
    ${eventBtnBase}
    top: 5.2rem;
    right: 10px;
  }

  > div {
    width: 100%;
    padding: 1.15rem 1rem;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;

    > section {
      display: flex;
      justify-content: center;
      column-gap: 0.5rem;

      // All direct divs
      > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        row-gap: 0.5rem;

        &:first-child {
          width: var(--event-item-left-width);
          display: flex;
          justify-content: center;

          > .icon {
            position: relative;
            width: 3.25rem;

            > .tooltip {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 99;
            }

            .eventIcon {
              background: var(--background-default);
              border: 1px solid var(--border-primary-color);
              border-radius: 50%;
              position: absolute;
              bottom: -0.65rem;
              right: -0.1rem;
              width: 1.75rem;
              height: 1.75rem;
              display: flex;
              align-items: center;
              justify-content: center;

              svg {
                width: 60%;
                height: 60%;
                color: var(--text-color-primary);
              }
            }
          }
        }
        &:last-child {
          flex-grow: 1;
        }

        h4,
        h5 {
          font-size: 1.15rem;
        }
        h4 {
          color: #b8b3b9;
          font-weight: 600;
        }
        h5 {
          color: var(--text-color-secondary);
          margin: 0.35rem 0;
        }
        p {
          color: #b8b3b9;
          font-weight: 600;
          margin: 0.2rem 0 0.4rem;
          font-size: 1.2rem;
          padding-right: 2.25rem;
        }
      }
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
        background-color: #953254;
        border: 1px solid #953254;
        color: #ededed;
      }
      .btn-mono-invert {
        border: 1px solid #a23b5e;
        color: #a23b5e;
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
