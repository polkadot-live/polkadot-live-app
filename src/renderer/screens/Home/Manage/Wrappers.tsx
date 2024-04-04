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
  overflow: hidden;
  overflow-y: scroll;
  width: 105%;
  padding-right: 5%;
`;

export const BreadcrumbsWrapper = styled.div`
  color: var(--text-color-primary);
  background-color: rgba(57, 52, 58, 0.4);
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
  position: sticky;
  width: 100%;
  top: 0rem;
  padding: 0.5rem 1rem;
  z-index: 3;
  opacity: 0.75;

  > h5 {
    display: flex;
    align-items: center;
    margin: 1rem 0;

    > span {
      margin-left: 1rem;
      color: var(--text-color-primary);
    }
    .icon {
      fill: var(--text-color-primary);
      width: 0.95rem;
      height: 0.95rem;
      margin-right: 0.5rem;
    }
  }
`;

export const AccountsWrapper = styled.div`
  --item-height: 2.75rem;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
`;

export const AccountWrapper = styled(motion.div)`
  background: var(--background-default);
  width: 100%;
  position: relative;
  margin-bottom: 0.5rem;
  border-radius: 1.25rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;

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
          height: var(--item-height);
          flex: 1;
          position: relative;
          margin-left: 0.75rem;

          h3 {
            &.permission {
              top: 0.8rem;
            }
            position: absolute;
            top: 0.55rem;
            left: 0;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin: 0;
            font-size: 1rem;
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
