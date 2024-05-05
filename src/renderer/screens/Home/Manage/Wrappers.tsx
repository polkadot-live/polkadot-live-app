// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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

export const BreadcrumbsWrapper = styled.div`
  color: var(--text-color-primary);
  background-color: var(--background-default);
  border-bottom: 1px solid #262626;
  padding: 0.75rem 1.75rem;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.02rem;

  ul {
    margin: 4px 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
    column-gap: 8px;

    li {
      opacity: 0.6;

      &:first-child > button {
        margin-left: -0.5rem;
        font-weight: 500;
        position: 'relative';
      }

      &:last-child {
        color: var(--text-color-primary);
        opacity: 1;
      }
    }
  }
`;

export const HeadingWrapper = styled.div`
  width: 100%;
  padding: 0.5rem 1rem;
  z-index: 3;
  opacity: 0.75;
  user-select: none;
  cursor: pointer;
  //margin-bottom: -0.5rem;

  .flex {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0.5rem;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 1rem;
      padding: 0.5rem;
    }

    .left {
      flex: 1;
      display: flex;
      column-gap: 0.75rem;
      justify-content: flex-start;

      .icon-wrapper {
        min-width: 0.75rem;
        opacity: 0.4;
      }
      h5 {
        > span {
          color: var(--text-color-primary);
        }
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }
`;

export const AccountsWrapper = styled.div`
  --item-height: 2.75rem;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;

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

  /* One-shot icon */
  .one-shot-wrapper {
    background-color: var(--background-default);
    margin-left: 1rem;

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
      column-gap: 1.5rem;

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
