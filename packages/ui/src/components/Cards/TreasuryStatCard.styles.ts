// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '../Common';
import type { ChainID } from '@polkadot-live/types/chains';

const getChainIdColor = (chainId: ChainID): string => {
  switch (chainId) {
    case 'Polkadot Relay': {
      return '#e63081';
    }
    case 'Kusama Relay': {
      return '#f1f1f1';
    }
    default: {
      return '#e63081';
    }
  }
};

export const TreasuryStatCardWrapper = styled.div<{ $chainId: ChainID }>`
  background-color: var(--background-primary-hover);
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h4 {
    color: ${({ $chainId }) => getChainIdColor($chainId)};
    font-size: 1.15rem;
    &.disable {
      animation: fadeInOut 3s infinite;
    }
  }
  > div:first-of-type {
    display: flex;
    gap: 0.25rem;

    h2 {
      color: var(--text-color-primary);
      font-size: 1.1rem;
    }
    .help-icon {
      ${mixinHelpIcon}
      color: var(--text-dimmed);
      font-size: 0.9rem;
      transition: color 150ms ease-out;
      &:hover {
        color: var(--text-highlight);
      }
    }
  }
  @keyframes fadeInOut {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 0.4;
    }
  }
`;
