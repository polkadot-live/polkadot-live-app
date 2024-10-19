// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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

export const AccountsWrapper = styled.div`
  --item-height: 2.75rem;
  width: 100%;
  margin-top: 1.25rem;
  padding: 0 0.5rem 1rem;

  .flex-column {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    margin: 0.5rem 0;
  }
`;

export const AccountWrapper = styled(motion.div)`
  background: var(--background-default);
  border: 1px solid var(--border-primary-color);
  width: 100%;
  position: relative;
  border-radius: 1.25rem;
  padding: 0.6rem 1.25rem;

  /* Native icon */
  .native-wrapper {
    background-color: var(--background-default);

    .native-content {
      position: relative;
    }

    .checked-icon-wrapper {
      position: absolute;
      bottom: 0;
      right: -2px;
      color: #c7c7c7;

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
      opacity: 0.4;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }
    }
    .disabled {
      transition: opacity 0.1s ease-in-out;
      padding: 0.5rem;
      opacity: 0.15;
    }
  }

  /* Remove button */
  .remove-wrapper {
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
      min-width: 24px;
      height: 24px;
    }

    .interval-badge {
      position: absolute;
      top: 9px;
      left: -12px;
      min-width: 46px;
      padding: 1px 0;
      opacity: 0.9;
      color: #cbcbcb;
      background-color: var(--border-mid-color);
      border: 1px solid var(--background-modal);
      border-radius: 1.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      text-align: center;
      z-index: 3;
    }

    &:hover {
      opacity: 0.6;
    }

    .enabled {
      padding: 0.5rem;
    }

    /* Select */
    .select-wrapper {
      display: flex;
      align-items: center;
      column-gap: 0.25rem;

      border: 1px solid var(--border-secondary-color);
      border-radius: 0.25rem;
      padding: 0.35rem 0.6rem;
      cursor: pointer;

      select {
        font-size: 1rem;
        background-color: inherit;
        color: #fcfcfc;
        opacity: 0.8;
        border: none;
        cursor: pointer;
      }
    }
  }

  /* One-shot icon */
  .one-shot-wrapper {
    background-color: var(--background-default);

    .enabled {
      cursor: pointer;
      padding: 0.5rem;
      transition: opacity 0.1s ease-in-out;

      &:hover {
        opacity: 0.6;
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

  > button {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
      column-gap: 1.6rem;

      &:first-child {
        overflow: hidden;

        .icon {
          height: var(--item-height);
          position: relative;
          top: 0rem;
          display: flex;
          align-items: center;

          &.permission {
            top: 0.15rem;
          }
        }

        span > .chain-icon {
          height: var(--item-height);
          width: 22px;
          fill: rgb(160, 37, 90);
          margin-right: 4px;
        }

        .content {
          display: flex;
          align-items: center;
          height: var(--item-height);
          flex: 1;

          h3 {
            display: flex;
            align-items: center;
            column-gap: 0.75rem;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin: 0;
            font-size: 1rem;

            &.permission {
              top: 0.8rem;
            }
            .icon-wrapper {
              margin-top: -2px;
              padding: 0 0.3rem;
              color: #4a4a4a;
              cursor: pointer;
              transition: color 0.2s ease-out;

              &:hover {
                color: #953254;
              }
            }
          }
        }
      }
      &:last-child {
        height: var(--item-height);
        position: relative;
        top: 0.15rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 0.25rem;
        flex-shrink: 0;

        &.permission {
          top: 0.3rem;
        }

        /* Scale the Switch component */
        label {
          scale: 0.9;
        }
      }
    }
  }
`;
