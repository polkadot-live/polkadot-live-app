// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@/types/chains';

/**
 * Provides the following styled components:
 *   OpenGovCard
 *   TreasuryStats
 */

export const OpenGovCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;

  padding: 1rem;
  border: 1px solid var(--border-primary-color);
  border-radius: 0.5rem;

  background-color: var(--background-primary);
  transition: background-color 0.2s ease-out;
  cursor: pointer;

  &:hover {
    background-color: var(--background-modal);
  }
  .content-wrapper {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    justify-content: center;
    padding: 1.5rem 1rem;

    .btn-polkadot {
      color: rgb(169 74 117);
    }
    .btn-kusama {
      color: #8571b1;
    }
    .btn-polkadot,
    .btn-kusama {
      display: flex;
      column-gap: 0.5rem;
      font-size: 1.1rem;

      > span {
        padding-right: 0.25rem;
      }
    }
  }
`;

export const TreasuryStats = styled.div<{ $chainId: ChainID }>`
  width: 100%;
  position: relative;
  padding: 1.75rem 1.5rem 1rem;

  .loading-wrapper {
    display: flex;
    column-gap: 1rem;
    justify-content: space-between;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-around;
    column-gap: 0.5rem;

    // Stats.
    .stat-wrapper {
      display: flex;
      flex-direction: column;
      justify-items: center;
      row-gap: 0.75rem;
      background-color: rgb(17 17 17);
      border: 1px solid var(--border-primary-color); //#2c2c2c;
      border-radius: 0.5rem;
      padding: 1rem 2.5rem;
      transition: background-color 0.2s ease-out;

      &:hover {
        background-color: var(--background-default);
      }

      .icon-wrapper {
        font-size: 0.8rem;
        padding-left: 0.65rem;
        padding-right: 0.2rem;
        cursor: pointer;
        opacity: 0.6;
        &:hover {
          color: #953254;
          opacity: 1;
        }
      }

      // Stat label.
      span {
        justify-content: center;
        display: flex;
        align-items: center;
        font-size: 1.05rem;
        color: ${(props) =>
          props.$chainId === 'Polkadot'
            ? 'var(--accent-color-primary)'
            : '#fbfbfb'};
      }
      // Stat text.
      h4 {
        justify-content: center;
        display: flex;
        flex: 1;
        font-size: 1.1rem;
      }
    }
  }
`;
