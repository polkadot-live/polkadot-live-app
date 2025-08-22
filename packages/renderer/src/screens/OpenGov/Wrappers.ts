// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@polkadot-live/types/chains';

export const NetworkHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--background-surface);
  flex: 1;
  justify-content: center;
  height: 36px;
`;

export const IconWrapper = styled.div<{ $chainId: ChainID }>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
  transition: opacity 0.2s ease-out;

  svg {
    top: ${(props) =>
      props.$chainId.startsWith('Polkadot') ? '-6px' : '-2rem'};
    left: ${(props) =>
      props.$chainId.startsWith('Polkadot') ? '4.75rem' : '3rem'};
    position: absolute;
  }
`;

export const TreasuryStats = styled.div<{ $chainId: ChainID }>`
  width: 100%;
  position: relative;

  .loading-wrapper {
    display: flex;
    column-gap: 1rem;
  }
  .PolkadotHubStats {
    background-color: var(--background-primary-hover);
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;

    .Heading {
      font-size: 1.1rem;
      padding: 1rem 1rem 0;
    }
    .StatsRow {
      > div:first-of-type {
        border-bottom-left-radius: 0.375rem;
      }
    }
  }
`;
