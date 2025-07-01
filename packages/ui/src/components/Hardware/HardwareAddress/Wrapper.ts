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

export const ActionBtn = styled.button`
  color: var(--text-color-secondary);
  background-color: var(--button-background-primary);
  border-color: var(--button-background-primary);
  border-radius: 0.15rem;
  min-width: 4.5rem;
  min-height: 22.52px;
  width: 4.5rem;
  padding: 0.45rem 0.2rem;
  font-size: 0.85rem;
  transition: all 150ms ease-out;

  &:hover:not(:disabled) {
    background-color: var(--button-background-primary-hover);
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
  .overflow {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .RenameBtn {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease-out;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.25;
    }
    &:hover:not(:disabled) {
      opacity: 1;
    }
  }
  .ManageBtn {
    font-size: 1rem;
    opacity: 0.85;
    color: var(--accent-secondary);
    cursor: pointer;
    &:hover:not(:disabled) {
      opacity: 1;
    }
  }
  .NoBookmarks {
    color: var(--text-color-secondary);
    opacity: 0.6;
    padding-left: 0.5rem;
  }
  .ChainIcon {
    position: absolute;
    top: 7px;
    left: 10px;
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 4px;
    transition: opacity 0.1s ease-out;
  }
  .NetworkIcon {
    min-width: 15px;
    width: 15px;
    height: 15px;
  }
  .EncodedRow {
    .NameAddressRow {
      flex: 1;
      min-width: 0;

      > .EntryArrow {
        color: var(--text-color-secondary);
        opacity: 0.35;
      }
      > span:first-of-type {
        font-size: 1.05rem;
      }
      > .AddressRow {
        color: var(--text-color-secondary);
        font-size: 0.98rem;
        opacity: 0.6;
        min-width: 0;
      }
      > .NetworkRow {
        background-color: var(--dialog-content-background);
        min-width: 160px;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;

        .NetworkLabel {
          color: var(--text-color-secondary);
          display: inline-block;
          font-size: 0.98rem;
          opacity: 0.8;
        }
        @media (max-width: 590px) {
          min-width: 0;
          .NetworkLabel {
            display: none;
          }
        }
      }
    }
  }

  /**
   * Action buttons.
   */
  .action-btn {
    color: var(--text-color-secondary);
    background-color: var(--button-background-primary);
    border-color: var(--button-background-primary);
    min-width: 4.5rem;
    max-height: 22px;
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
  .PrimaryRow {
    position: relative;
    padding: 0.5rem 0 0.95rem 0.25rem;
    width: 100%;
    display: flex;
    flex: 1;

    h2 {
      font-size: 1.15rem;
    }
    .fade {
      opacity: 0.5;
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
