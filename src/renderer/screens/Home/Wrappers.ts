// Copyright 2023 @paritytech/polkadot-live authors & contributors
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
      background-color: rgb(45, 41, 45);
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgb(25, 22, 25);
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
  border-bottom: 2px solid var(--border-primary-color);
  width: 100%;
  display: flex;
  z-index: 2;
  margin-top: 3rem;

  > button {
    font-family: InterSemiBold, sans-serif;
    color: var(--text-color-secondary);
    height: var(--tab-height);
    flex-basis: 50%;
    transition: background 0.15s;
    padding-top: 0.5rem;
    font-size: 1.1rem;

    &:hover {
      background: var(--background-menu);
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
  top: 3rem;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
`;

export const NoAccountsWrapper = styled.div`
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    z-index: 1;
    padding: 0.5rem 1.75rem !important;
  }
  h4 {
    text-align: center;
    margin: 0.65rem 0;
  }
`;

export const HeadingWrapper = styled.div`
  width: 100%;
  margin-top: 0rem;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
  opacity: 0.75;

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
