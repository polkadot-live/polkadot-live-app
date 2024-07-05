// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const CarouselWrapper = styled(motion.div)`
  position: relative;
  overflow: hidden;
  width: 200%;
  display: flex;
  height: 100%;
  max-height: 100%;
  margin-bottom: 3rem;

  .scrollable {
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;

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
  }
  > div {
    position: relative;
    width: 50%;
    flex-grow: 1;

    .container {
      width: 100;
      max-width: 100%;
      height: 100%;
      max-height: 100%;
      position: relative;
      overflow: hidden;
    }
  }
`;

export const TabsWrapper = styled.div`
  --tab-height: 3.3rem;
  background-color: var(--background-menu);
  border-bottom: 2px solid var(--border-primary-color);
  width: 100%;
  display: flex;
  z-index: 2;
  margin-top: 3rem;
  padding-top: 0.5rem;

  > button {
    font-family: InterSemiBold, sans-serif;
    color: var(--text-color-secondary);
    height: var(--tab-height);
    flex-basis: 50%;
    transition: background-color 0.15s;
    padding-top: 0.5rem;
    font-size: 1.1rem;

    &:hover {
      background: #1e1e1e;
    }

    > span {
      position: relative;
      top: -1px;
      box-sizing: border-box;
      padding: 0.75rem 0;
    }

    &.active {
      color: var(--text-color-primary);
      > span {
        height: var(--tab-height);
        border-bottom: 2px solid var(--border-secondary-color);
      }
    }
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  top: 6rem;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
`;

export const NoAccountsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  align-items: center;
  margin: 0.25rem;
  margin-bottom: 0.75rem;
  padding: 2rem;
  border-radius: 1.25rem;
  background-color: var(--background-default);

  button {
    z-index: 1;
    padding: 0.5rem 1.75rem !important;
  }
  h4 {
    text-align: center;
  }
`;

export const HeadingWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  opacity: 0.75;
  user-select: none;
  cursor: pointer;

  .flex {
    padding: 0.25rem 0;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);
    transition: background-color 0.15s ease-in-out;

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      column-gap: 1rem;
      padding: 0.5rem;
    }
    .left {
      display: flex;
      justify-content: flex-start;
      flex: 1;

      .icon-wrapper {
        min-width: 0.75rem;
        opacity: 0.4;
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }

  h5 {
    display: flex;
    align-items: flex-end;
  }

  .icon {
    fill: var(--text-color-primary);
    width: 0.95rem;
    height: 0.95rem;
    margin-right: 0.6rem;
  }
`;
