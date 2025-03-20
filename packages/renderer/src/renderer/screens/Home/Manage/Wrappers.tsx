// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { mixinHelpIcon } from '@polkadot-live/ui/components';
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  height: 100%;
  max-height: 100%;
`;

export const ItemsColumn = styled.div`
  width: 100%;
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
`;

export const ItemEntryWrapper = styled(motion.div)`
  width: 100%;
  position: relative;
  padding: 1.15rem 1rem;
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

      span > .chain-icon {
        width: 16px;
        fill: rgb(160, 37, 90);
        margin-right: 4px;
        margin-top: 4px;
      }
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
          font-size: 1.05rem;
        }
      }
    }
  }
`;

export const TaskEntryWrapper = styled(motion.div)`
  background: var(--background-primary);
  width: 100%;
  position: relative;
  padding: 1.15rem 1rem;
  max-height: 54px;
  overflow: hidden;

  /* OS Notifications Icon */
  .native-wrapper {
    color: var(--text-color-secondary);

    .native-content {
      position: relative;
    }

    .checked-icon-wrapper {
      color: var(--text-color-tertiary);
      position: absolute;
      bottom: 0;
      right: -2px;

      .disable {
        opacity: 0.4;
      }
    }

    .checked {
      transition: opacity 0.1s ease-in-out;
      padding: 0.5rem;
      cursor: pointer;
    }
    .unchecked {
      transition: opacity 0.1s ease-in-out;
      padding: 0.5rem;
      opacity: 0.7;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
    .disabled {
      transition: opacity 0.1s ease-in-out;
      padding: 0.5rem;
      opacity: 0.25;
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
      color: var(--text-color-tertiary);
      background-color: var(--border-mid-color);
      position: absolute;
      top: 9px;
      left: -6px;
      min-width: 46px;
      padding: 1px 0;
      opacity: 0.9;
      border-radius: 1.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      text-align: center;
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

          h3 {
            display: flex;
            align-items: center;
            column-gap: 0.5rem;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin: 0;
            font-size: 1.15rem;

            .icon-wrapper {
              color: var(--text-dimmed);
              ${mixinHelpIcon}
              font-size: 1rem;
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
