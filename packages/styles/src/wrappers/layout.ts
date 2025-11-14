// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import type { ChainID } from '@polkadot-live/types/chains';

// The outer-most component wrapping the app.
export const MainInterfaceWrapper = styled.div`
  background: var(--background-window);
  color: var(--text-color-primary);
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  height: 100vh;
  width: 100%;

  .Toastify__toast {
    font-size: 1.15rem;
    color: var(--text-color-primary);
    background-color: var(--background-window);
    border: 1px solid var(--border-mid-color);
    border-radius: 1rem;
    margin: 0.5rem;
    margin-top: 0.75rem;
    max-width: 97%;
  }
`;

// A component that consumes the height of the window, can sit in-between the header and footer.
export const BodyInterfaceWrapper = styled.div<{
  $maxHeight?: boolean;
}>`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
  position: relative;

  .app-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80%;

    > p {
      color: var(--text-color-primary);
      font-size: 1.2rem;
      text-align: center;
      margin-top: 20px;
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

// Wrapper containing the side nav and main content.
export const FixedFlexWrapper = styled.div`
  display: flex;
  width: 100%;
  position: fixed;
  top: 3rem; // header height
  bottom: 3rem; // footer height
  left: 0;
`;

// Main window background icon wrapper.
export const BackgroundIconWrapper = styled.div`
  position: absolute;
  top: 6rem;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
`;

/**
 * @name StatsFooter
 * @summary Footer layout for child window.
 */
export const StatsFooter = styled.section<{ $chainId: ChainID }>`
  background-color: var(--background-surface);
  border-top: 1px solid var(--border-primary-color);
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 0.75rem 1.5rem;

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
      opacity: 0.4;
      cursor: pointer;
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
      transition: opacity 150ms ease-out;
      .icon-wrapper {
        transition: opacity 150ms ease-out;
      }
      &:hover {
        opacity: 0.8;
      }
    }
  }

  .footer-stat {
    display: flex;
    column-gap: 0.75rem;
    align-items: center;

    h2 {
      font-size: 0.95rem;
      color: var(--text-color-secondary);
    }
    span {
      color: ${(props) =>
        props.$chainId.startsWith('Polkadot')
          ? 'rgb(169, 74, 117)'
          : '#8571b1'};
      font-weight: 400;
      font-size: 0.95rem;
    }
  }
`;
