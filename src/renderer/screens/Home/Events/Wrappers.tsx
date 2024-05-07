// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const SortControlsWrapper = styled.div`
  .controls-wrapper {
    width: 100%;
    background-color: var(--background-primary);
    border-radius: 0.25rem;
    border-bottom: 1px solid var(--border-primary-color);
    padding: 1.5rem 1.5rem 1.25rem;
    flex: 1;

    display: flex;
    justify-content: start;
    align-items: center;
    column-gap: 1rem;

    .icon-wrapper {
      opacity: 0.75;
      display: flex;
      column-gap: 0.75rem;
      align-items: center;
      min-width: 120px;

      position: relative;
      border: 1px solid #535353;
      border-radius: 1.25rem;

      margin: 0;
      padding: 0.3rem 0.5rem;
      transition: border 0.1s ease-out;
      user-select: none;
      cursor: pointer;
      transition: opacity 0.1s ease-out;

      span {
        display: inline-block;
        padding-right: 0.7rem;
        color: #666666;
        font-size: 0.9rem;
      }
      .icon {
        color: #5f5f5f;
        margin-left: 0.7rem;
      }
      &:hover {
        opacity: 0.9;
      }
      // Button is active.
      &.active {
        border-color: #454545;
        background-color: #3a3a3a;
        transition: opacity 0.1s ease-out;
        .icon,
        span {
          color: #ededed;
        }
        &:hover {
          background-color: #3a3a3a;
        }
      }
    }
  }
`;

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  row-gap: 0.5rem;
  padding: 0 1rem;
`;

export const NoEventsWrapper = styled.div`
  margin-top: 6rem;
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
  border-radius: 0.9rem;
  z-index: 2;
  padding: 0 0.5rem;
  margin-bottom: 1rem;

  .items-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    padding: 0 0.25rem;
  }
`;

export const EventItem = styled(motion.div)`
  --event-item-left-width: 4rem;

  position: relative;

  > span:first-child {
    text-align: right;
    position: absolute;
    top: 1.5rem;
    right: 44px;
    color: #4d4c4c;
    transition: color ease-out 0.1s;
    cursor: pointer;
  }
  > span:first-child:hover {
    color: var(--text-color-secondary);
  }

  > .dismiss-btn {
    position: absolute;
    width: 2.2rem;
    height: 2.2rem;
    top: 1rem;
    right: 10px;
    transition: color 0.2s ease-out;
    padding: 0;
    border-radius: 0.65rem;
    border: 1px solid var(--border-mid-color);
    cursor: pointer;

    svg {
      color: var(--border-mid-color);
    }
    &:hover {
      border-color: #7e3333;
      svg {
        color: #7e3333;
      }
    }
  }

  .show-actions-btn {
    background-color: #953254;
    position: absolute;
    top: 4rem;
    right: 10px;
    width: 2.2rem;
    height: 2.2rem;
    opacity: 0.3;
    border-radius: 0.65rem;
    padding: 0;
    cursor: pointer;

    transition: opacity 0.1s ease-out;
    &:hover {
      opacity: 0.75;
    }
    svg {
      color: #f1f1f1;
    }
  }

  > div {
    background: var(--background-default);
    border: 1px solid var(--border-primary-color);
    width: 100%;
    border-radius: 1.25rem;
    padding: 1rem;

    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;

    > section {
      display: flex;
      justify-content: center;
      column-gap: 1rem;

      &.actions {
        margin-top: 0.5rem;
        padding: 1rem 0 0.5rem;

        .btn-mono {
          background-color: #953254;
          border: 1px solid #953254;
          color: #ededed;
        }
        .btn-mono-invert {
          border: 1px solid #a23b5e;
          color: #a23b5e;
        }
      }

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
        h5,
        p {
          font-size: 1.1rem;
        }
        h4 {
          color: var(--text-color-primary);
          font-weight: 600;
        }
        h5 {
          color: var(--text-color-secondary);
          margin: 0.35rem 0;
        }
        p {
          font-weight: 600;
          margin: 0.2rem 0 0.4rem;
        }
      }
    }
  }
  &:last-child {
    margin-bottom: 0;
  }
`;
