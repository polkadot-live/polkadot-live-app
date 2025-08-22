// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@polkadot-live/types/chains';

export const TreasuryBalanceCardWrapper = styled.div<{ $chainId: ChainID }>`
  background-color: var(--background-primary-hover);
  padding: 0.5rem 1rem 0.75rem;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;

  h2 {
    color: var(--text-color-secondary);
    font-size: 1.1rem;
    opacity: 0.75;
  }
  h4 {
    color: var(--text-color-primary);
    font-size: 1.1rem;
    &.disable {
      animation: fadeInOut 3s infinite;
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
