// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import { styled } from 'styled-components';
import { mixinHelpIcon } from './mixins';

export const ItemEntryWrapper = styled(motion.div)`
  width: 100%;
  position: relative;
  padding: 1.1rem 1rem;
  cursor: pointer;

  > .inner {
    display: flex;
    width: 100%;
    max-width: 100%;
    align-items: center;

    > div:nth-child(2) {
      justify-self: end;
    }
    > div:nth-child(1) {
      flex: 1;
      display: flex;
      position: relative;
      align-items: center;
      column-gap: 1.25rem;
      overflow: hidden;

      .content {
        flex: 1;
        display: flex;
        align-items: center;

        > h3 {
          width: 100%;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          margin: 0;
          font-size: 1.03rem;
        }
      }
    }
  }
`;

export const TaskEntryWrapper = styled(motion.div)`
  background: var(--background-primary);
  position: relative;
  display: flex;
  align-items: center;
  min-height: 40px;
  width: 100%;
  padding: 0.5rem 1rem;
  overflow: hidden;

  /* OS Notifications Icon */
  .native-wrapper {
    color: var(--text-color-secondary);
    font-size: 1.1rem;

    .native-content {
      position: relative;
    }
  }

  /* Remove button */
  .remove-wrapper {
    color: var(--text-color-secondary);

    .enabled {
      cursor: pointer;
      padding: 0.5rem;
      transition: opacity 0.1s ease-in-out;

      &:hover {
        opacity: 0.6;
      }
    }
  }

  /* Interval button */
  .interval-wrapper {
    position: relative;
    transition: opacity 0.1s ease-in-out;
    cursor: pointer;

    .badge-container {
      position: relative;
      min-width: 32px;
      height: 24px;
    }

    .interval-badge {
      color: var(--text-color-primary);
      opacity: 0.9;
      font-size: 0.82rem;
      font-weight: 600;
      padding-right: 0.5rem;
      text-align: left;
      min-width: 42px;
      z-index: 3;
    }

    &:hover {
      .badge-container {
        opacity: 0.6;
      }
    }
    .enabled {
      padding: 0.5rem;
    }

    /* Select */
    .select-wrapper {
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      column-gap: 0.25rem;
      padding: 0rem 0.6rem;
      cursor: pointer;

      select {
        color: var(--text-color-tertiary);
        font-size: 1rem;
        background-color: inherit;
        opacity: 0.8;
        border: none;
        cursor: pointer;
      }
      .close {
        transition: opacity 120ms ease-out;
        &:hover {
          opacity: 0.6;
        }
      }
    }
  }

  /* One-shot icon */
  .one-shot-wrapper {
    color: var(--text-color-secondary);

    .enabled {
      cursor: pointer;
      padding: 0.5rem;
      transition: opacity 0.1s ease-in-out;

      &:hover {
        opacity: 0.8;
      }
    }
    .processing {
      transition: opacity 0.1s ease-in-out;
      padding: 0.5rem;
    }
    .disabled {
      transition: opacity 0.1s ease-in-out;
      padding: 0.5rem;
      opacity: 0.4;
    }
  }

  > .inner {
    display: flex;
    width: 100%;
    max-width: 100%;
    align-items: center;
    font-size: 0.9rem;

    > div {
      display: flex;
      position: relative;
      flex: 1;
      align-items: center;
      column-gap: 1.25rem;

      &:first-child {
        overflow: hidden;

        .content {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          margin-right: 1rem;

          h3 {
            display: flex;
            align-items: center;
            column-gap: 0.5rem;
            width: 100%;
            margin: 0;
            font-size: 1.05rem;

            .task-title {
              font-size: 1rem;
              color: var(--text-color-secondary);
            }

            .icon-wrapper {
              color: var(--text-dimmed);
              ${mixinHelpIcon}
              font-size: 0.96rem;
              transition: color 150ms ease-out;
              &:hover {
                color: inherit;
              }
            }
          }
        }
      }
      &:last-child {
        position: relative;
        top: 0.15rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 0.25rem;
        flex-shrink: 0;

        /* Scale the Switch component */
        label {
          scale: 0.9;
        }
      }
    }
  }
`;
