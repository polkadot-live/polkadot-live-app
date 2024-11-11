// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

// Wrapper containing the side nav and main content.
export const FixedFlexWrapper = styled.div`
  display: flex;
  width: 100%;
  position: fixed;
  top: 3rem; // header height
  bottom: 3rem; // footer height
  left: 0;
`;

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

export const IconWrapper = styled.div`
  position: absolute;
  top: 6rem;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
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
