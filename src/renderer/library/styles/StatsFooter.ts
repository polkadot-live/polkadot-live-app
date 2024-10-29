// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@/types/chains';

/**
 * @name StatsFooter
 * @summary Footer layout for child window.
 */
export const StatsFooter = styled.section<{ $chainId: ChainID }>`
  position: fixed;
  bottom: 0;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border-top: 1px solid var(--border-primary-color);
  background-color: var(--background-primary);

  > div:first-of-type {
    display: flex;
    column-gap: 1rem;
    align-items: center;
  }

  // Left and right.
  .right,
  .left {
    display: flex;
    align-items: center;
    column-gap: 1rem;
  }
  .left {
    flex: 1;
  }

  .stat-wrapper {
    display: flex;
    column-gap: 1rem;
    display: flex;
    align-items: center;

    // Help icon.
    .icon-wrapper {
      font-size: 0.8rem;
      padding-right: 0.75rem;
      padding-left: 0.4rem;
      cursor: pointer;
      opacity: 0.4;
      &:hover {
        color: #953254;
        opacity: 1;
      }
    }

    // Stat label.
    span {
      display: flex;
      align-items: baseline;
      padding: 0.5rem;
      padding-right: 1rem;
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.5rem;
      font-size: 0.8rem;
    }

    &.badge-btn {
      cursor: pointer;
      color: inherit;
      transition: color 150ms ease-out;
      .icon-wrapper {
        transition: color 150ms ease-out;
      }
      &:hover {
        .icon-wrapper {
          color: #f1f1f1;
          opacity: 1;
        }
        color: #f1f1f1 !important;
      }
    }
  }

  .footer-stat {
    display: flex;
    column-gap: 0.75rem;
    align-items: center;

    h2 {
      font-size: 0.95rem;
      opacity: 0.5;
    }
    span {
      color: ${(props) =>
        props.$chainId === 'Polkadot' ? 'rgb(169, 74, 117)' : '#8571b1'};
      font-weight: 400;
      font-size: 0.95rem;
    }
  }
`;
