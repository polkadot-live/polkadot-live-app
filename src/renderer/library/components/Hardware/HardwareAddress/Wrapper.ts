// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

const mixinAddressInput = css`
  border: 1px solid var(--border-mid-color);
  color: var(--text-color-primary);

  width: 100%;
  max-width: 380px;
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
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: default;

  // Utility Classes
  .flex-inner-row {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
  }

  > .action {
    height: 100%;
    flex-basis: auto;
    display: flex;
    flex-direction: row;
    column-gap: 1rem;
    padding-left: 1rem;

    .account-action-btn {
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
  }

  > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    > .inner {
      display: flex;
      align-items: center;

      > .identicon {
        flex-shrink: 1;
        flex-grow: 0;
        position: relative;
      }

      > div:last-child {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        flex-grow: 1;

        // Edit buttons.
        button {
          margin-left: 0.5rem;
        }

        section {
          width: 100%;
          display: flex;
          padding-left: 1.5rem;

          .input-wrapper {
            position: relative;
            display: flex;
            flex: 1;

            .fade {
              opacity: 0.5;
            }

            // Chain icon.
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

          .edit {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            margin-left: 0.75rem;

            button {
              font-size: 1.1rem;
              &:hover {
                color: var(--text-highlight);
              }
            }
          }
        }

        h5,
        button {
          font-size: 0.9rem;

          &.label {
            display: flex;
            align-items: flex-end;
            margin-right: 0.5rem;
            margin-bottom: 0.85rem;
          }
        }

        input {
          ${mixinAddressInput}
          border-radius: 0.375rem;
          border: 1px dashed #1c1c1c;
          padding: 0.85rem 0.75rem;
          transition: border-color 150ms ease-out;
          padding-left: 38px;

          &:focus {
            background-color: var(--background-surface);
          }
        }

        // For read only address input.
        .add-input {
          ${mixinAddressInput}
          border-radius: 1.25rem;
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
        }

        .full {
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          opacity: 0.8;
          position: relative;
          height: 1rem;
          width: 100%;

          > span {
            position: absolute;
            top: 0;
            left: 0;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 1.5rem;
            width: 100%;
            max-width: 100%;
          }
        }
      }
    }
  }

  &:hover {
    input {
      border-color: var(--border-mid-color) !important;
    }
  }

  .more {
    margin-top: 1rem;
    padding: 0 1.5rem;

    h4 {
      opacity: var(--opacity-disabled);
      padding: 0;
    }
  }
`;
