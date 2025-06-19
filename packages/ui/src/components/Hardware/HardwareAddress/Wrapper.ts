// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

const mixinAddressInput = css`
  border: 1px solid var(--border-mid-color);
  color: var(--text-color-primary);

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.04rem;
  font-size: 1.15rem;

  transition:
    background-color 0.2s,
    max-width 0.2s,
    padding 0.2s;

  &:focus {
    background: var(--background-surface);
    max-width: 380px;
  }

  &:disabled {
    border: none;
    background: none;
  }
`;

export const HardwareAddressWrapper = styled.div`
  padding: 0.5rem 1rem;
  cursor: default;

  .identicon {
    flex-shrink: 1;
    flex-grow: 0;
    position: relative;
  }

  /**
   * Action buttons.
   */
  .action-btn {
    color: var(--text-color-secondary);
    background-color: var(--button-background-primary);
    border-color: var(--button-background-primary);
    min-width: 4.5rem;
    padding: 0.45rem 0.5rem;
    font-size: 0.85rem;
    transition: all 150ms ease-out;

    &:hover {
      background-color: var(--button-background-primary-hover);
    }
  }
  .white-hover:hover {
    color: var(--text-highlight);
  }
  .processing {
    color: var(--text-dimmed);
  }

  /**
   * Input.
   */
  input {
    ${mixinAddressInput}
    border-radius: 0.375rem;
    border: 1px dashed #1c1c1c;
    padding: 0.85rem 0.75rem;
    transition: border-color 150ms ease-out;
    margin-bottom: 0.75rem;

    &:focus {
      background-color: var(--background-surface);
    }
  }
  .input-wrapper {
    position: relative;
    display: flex;
    flex: 1;

    h2 {
      font-size: 1.15rem;
    }
    .fade {
      opacity: 0.5;
    }
    .chain-icon {
      position: absolute;
      top: 7px;
      left: 10px;
      width: 1.5rem;
      height: 1.5rem;
      margin-top: 4px;
      transition: opacity 0.1s ease-out;

      ellipse {
        fill: var(--polkadot-pink);
      }
    }
  }

  /**
   * Edit buttons.
   */
  .edit {
    margin-left: 1rem;
    margin-right: 0.25rem;

    button {
      font-size: 1.1rem;
      &:hover {
        color: var(--text-highlight);
      }
    }
  }

  /**
   * For read only address input.
   */
  .add-input {
    ${mixinAddressInput}
    border-radius: 1.25rem;
    padding: 0.6rem 1.25rem;
    font-size: 0.95rem;
  }

  &:hover {
    input {
      border-color: var(--border-mid-color) !important;
    }
  }
`;
