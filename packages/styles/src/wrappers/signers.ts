// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

/**
 * Ledger sign overlay wrapper.
 */
export const LedgerOverlayWrapper = styled.div`
  background-color: var(--background-overlay-surface);
  width: 100%;
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2rem 1.75rem;
  text-align: center;
  border-radius: 0.375rem;

  .LedgerIcon {
    height: 2.25rem;
    width: fit-content;
    margin: 0.25rem 0 0.75rem;
  }
  .LedgerColumn {
    h1 {
      font-size: 1.1rem;
    }
    p {
      line-height: 1.75rem;
    }
  }

  .ContentColumn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;

    h4 {
      color: var(--text-color-primary);
      font-size: 1.25rem;
    }
    p {
      color: var(--text-color-secondary);
      margin: 0;
      line-height: 1.75rem;
    }
  }
`;

/**
 * WalletConnect sign overlay wrapper.
 */
export const WcOverlayWrapper = styled.div`
  background-color: var(--background-overlay-surface);
  width: 100%;
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2rem 1.75rem;
  text-align: center;
  border-radius: 0.375rem;

  .ContentColumn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;

    .VerifyingColumn {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      align-items: center;
    }
    h4 {
      color: var(--text-color-primary);
      font-size: 1.25rem;
    }
    p {
      color: var(--text-color-secondary);
      margin: 0;
      line-height: 1.75rem;
    }
  }
`;

export const QRViewerWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2rem 1rem;

  .title {
    color: var(--network-color-primary);
    font-family: 'Unbounded';
    margin-bottom: 1rem;
  }

  .progress {
    background-color: var(--background-surface);
    margin-bottom: 1rem;
    border-radius: 1rem;
    padding: 0.45rem 1.5rem 0.45rem 1.5rem;

    span {
      font-size: 1rem;
      opacity: 0.4;
      &.active {
        opacity: 1;
      }
    }
    .arrow {
      margin: 0 0.85rem;
    }
  }

  .viewer {
    border-radius: 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;

    &.withBorder {
      padding: 0.95rem;
      border: 3.75px solid var(--network-color-pending);
    }
  }

  /* Override QRScanner styles */
  > .payload-wrapper {
    width: 175px !important;
    height: 175px !important;
    > section > section > div {
      border-width: 20px !important;
    }
  }
  .foot {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1.75rem;
    padding: 0 1rem;
    width: 100%;

    .address {
      display: flex;
      margin-top: 0.5rem;
      margin-bottom: 1.25rem;

      svg {
        margin-right: 0.6rem;
      }
    }
    > div {
      display: flex;
      width: 100%;
      justify-content: center;
    }
  }
`;
