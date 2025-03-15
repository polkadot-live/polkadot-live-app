// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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

export const TriggerRightIconWrapper = styled.div`
  svg {
    opacity: 0.75;
    transition: opacity 200ms ease-out;
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
`;

/** TODO: Remove */
export const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: var(--background-default);
  border-top: 1px solid var(--border-primary-color);
`;

export const EmptyExtrinsicsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    text-align: left;

    svg {
      color: var(--text-color-secondary);
    }
    p {
      color: var(--text-color-secondary);
      opacity: 0.8;
      font-size: 1.25rem;
      text-align: left;
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

/**
 * WalletConnect Sign Overlay
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
