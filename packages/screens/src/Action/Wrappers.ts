// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const ExtrinsicItemContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 0.5rem;

  p {
    margin: 0;
  }
  .WarningBox {
    color: var(--accent-warning);
    font-size: 1rem;
    padding: 0.5rem 0;
  }
  .SummaryButton {
    background-color: var(--button-background-primary);
    border-radius: var(--button-border-radius-small);
    padding: 0.6rem 1rem;
    font-size: var(--button-font-size-small);
    transition: background-color 0.2s ease-out;

    &:hover {
      background-color: var(--button-background-primary-hover);
    }
  }
`;

export const SubmittedTxWrapper = styled.div`
  background: var(--background-status-overlay);
  backdrop-filter: blur(1px);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;

  h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }

  .close {
    margin-top: 1.5rem;
  }
`;
