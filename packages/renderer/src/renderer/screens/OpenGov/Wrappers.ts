// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@polkadot-live/types/chains';

/**
 * Provides the following styled components:
 *   OpenGovCard
 *   TreasuryStats
 */
export const IconWrapper = styled.div<{ $chainId: ChainID }>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
  transition: opacity 0.2s ease-out;

  svg {
    top: ${(props) => (props.$chainId === 'Polkadot' ? '-6px' : '-2rem')};
    left: ${(props) => (props.$chainId === 'Polkadot' ? '4.75rem' : '3rem')};
    position: absolute;
  }
`;

export const TreasuryStats = styled.div<{ $chainId: ChainID }>`
  width: 100%;
  position: relative;
  padding: 1.25rem 1.5rem 0.5rem;

  .loading-wrapper {
    display: flex;
    column-gap: 1rem;
  }
`;