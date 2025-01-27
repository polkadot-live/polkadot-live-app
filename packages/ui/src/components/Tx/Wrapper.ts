// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  &.margin {
    margin-top: 1rem;
  }

  .sign {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.25rem;
    font-size: 0.9rem;

    .badge {
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.45rem;
      padding: 0.5rem 0.75rem;

      > svg {
        margin-right: 0.5rem;
      }
    }

    .not-enough {
      margin-left: 0.5rem;
    }

    .danger {
      color: var(--status-danger-color);
    }

    > .icon {
      margin-right: 0.3rem;
    }
  }

  > .inner {
    background: transparent;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 0.75rem;

    &.canvas {
      background: var(--background-canvas-card);
    }

    // Signer component.
    > section {
      flex: 1;

      > .signer-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        justify-content: right;

        p {
          color: var(--text-color-secondary);
          display: flex;
          align-items: center;
          font-size: 1rem;
          margin: 0.1rem 0;
          padding-left: 0.5rem;

          &.prompt {
            color: var(--accent-primary);
            font-size: 1.05rem;
            align-items: flex-start;

            .icon {
              margin-top: 0.16rem;
              margin-right: 0.5rem;
            }
          }
        }
      }

      button {
        margin-left: 0.75rem;
      }
    }

    &.warning {
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      padding: 0.5rem 0;
    }

    &.msg {
      border-top: 1px solid var(--border-primary-color);
      padding: 0.5rem 0;
      margin-top: 0.25rem;
    }
  }
`;
