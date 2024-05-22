// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@/types/chains';

/**
 * Provides the following styled components:
 *   Scrollable
 *   OpenGovFooter
 */

export const Scrollable = styled.div`
  --footer-height: 44px;

  width: 100%;
  height: calc(92vh - var(--footer-height)); // minus footer height
  padding: 1.5rem 0 1rem;
  overflow-y: auto;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #212121;
  }
`;

export const OpenGovFooter = styled.section<{ $chainId: ChainID }>`
  position: fixed;
  bottom: 0;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border-top: 1px solid var(--border-primary-color);
  background-color: var(--background-primary);

  > div:first-of-type {
    display: flex;
    column-gap: 1rem;
    align-items: baseline;
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
