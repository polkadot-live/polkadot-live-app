// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: var(--background-default);
  border-top: 1px solid var(--border-primary-color);
`;

export const EstimatedFee = styled.div`
  p {
    color: var(--text-color-secondary);
    padding: 0;
    font-size: 1rem;
    margin: 0.5rem 0;

    > span {
      margin: 0 0.5rem 0 0;
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
