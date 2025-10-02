// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
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

  .scrollable {
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;

    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background-color: var(--scrollbar-track-background-color);
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--scrollbar-thumb-background-color);
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

export const NoAccountsWrapper = styled.div`
  color: var(--text-color-primary);
  background-color: var(--background-primary);
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  align-items: center;
  margin: 0.75rem 1rem;
  padding: 2rem;
  border-radius: 0.375rem;

  button {
    z-index: 1;
    padding: 0.5rem 1.75rem !important;
  }
  h4 {
    text-align: center;
  }
`;
