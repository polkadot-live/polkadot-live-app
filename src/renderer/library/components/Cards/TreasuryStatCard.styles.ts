// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '../Common';
import type { ChainID } from '@/types/chains';

const getChainIdColor = (chainId: ChainID): string => {
  switch (chainId) {
    case 'Polkadot': {
      return '#e63081';
    }
    case 'Kusama': {
      return '#f1f1f1';
    }
    default: {
      return '#e63081';
    }
  }
};

export const TreasuryStatCardWrapper = styled.div<{ $chainId: ChainID }>`
  background-color: #202020;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h4 {
    font-size: 1.15rem;
    color: ${({ $chainId }) => getChainIdColor($chainId)};
  }
  > div:first-of-type {
    display: flex;
    gap: 0.25rem;

    h2 {
      font-size: 1.1rem;
      color: var(--text-color-primary);
    }
    .help-icon {
      ${mixinHelpIcon}
      color: #5a5a5a;
      font-size: 0.9rem;
      transition: color 150ms ease-out;
      &:hover {
        color: #f1f1f1;
      }
    }
  }
`;
