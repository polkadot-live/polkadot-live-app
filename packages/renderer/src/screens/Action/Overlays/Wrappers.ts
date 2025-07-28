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
