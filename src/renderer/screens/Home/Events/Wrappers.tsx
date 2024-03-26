// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
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
  margin: 1rem 0;
  z-index: 2;
  padding: 0 0.5rem;
`;

export const EventItem = styled(motion.div)`
  --event-item-left-width: 4rem;

  position: relative;

  > span:first-child {
    text-align: right;
    position: absolute;
    bottom: 2.2rem;
    right: 15px;
    color: #4d4c4c;
    transition: color ease-out 0.1s;
    cursor: pointer;
  }
  > span:first-child:hover {
    color: var(--text-color-secondary);
  }

  > button {
    position: absolute;
    top: 1.5rem;
    right: 15px;
  }

  > div {
    background: var(--background-default);
    width: 100%;
    border-radius: 1.75rem;
    padding: 0 1.25rem;
    margin-bottom: 0.5rem;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;

    > section {
      display: flex;

      &.actions {
        margin: 0.7rem 0 0rem 0;
        padding-left: 3.75rem;
        button {
          margin-right: 0.9rem;
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
          margin-bottom: 0.35rem;
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
