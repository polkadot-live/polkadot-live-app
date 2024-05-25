// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@/types/chains';

/**
 * Provides the following styled components:
 *   Scrollable
 *   OpenGovCard
 *   OpenGovFooter
 *   TreasuryStats
 */

export const Scrollable = styled.div`
  --footer-height: 42.06px;
  --header-height: 38.6px;

  // height = window height - (header height + footer height)
  height: calc(100vh - var(--footer-height) - var(--header-height));
  width: 100%;
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

  // Placeholder loader.
  @keyframes placeholderAnimate {
    0% {
      background-position: -650px 0;
    }
    100% {
      background-position: 650px 0;
    }
  }

  .placeholder-content-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    margin-top: 2rem;

    .placeholder-content {
      height: 3rem;
      background: #000;
      border-radius: 1.25rem;

      // Animation
      animation-duration: 3s;
      animation-fill-mode: forwards;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-name: placeholderAnimate;
      background: #101010; // Fallback
      background: linear-gradient(
        to right,
        #101010 2%,
        #202020 18%,
        #101010 33%
      );
      background-size: 1200px; // Animation Area
    }
  }
`;

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

export const TreasuryStats = styled.div`
  width: 100%;
  position: relative;
  padding: 1.75rem 1.5rem;

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
        color: var(--accent-color-primary);
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
