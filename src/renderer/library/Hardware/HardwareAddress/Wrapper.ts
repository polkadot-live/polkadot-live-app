// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const Wrapper = styled.div<{ $noBorder?: boolean }>`
  border-bottom: ${(props) =>
    String(props.$noBorder) === 'true'
      ? 'none'
      : '1px solid var(--border-primary-color)'};
  display: flex;
  align-items: center;
  padding: 1.25rem;

  /* 3 Dot Spinner */
  .lds-ellipsis {
    /* change color here */
    color: #afafaf;
  }
  .lds-ellipsis,
  .lds-ellipsis div {
    box-sizing: border-box;
  }
  .lds-ellipsis {
    margin-left: 8px;
    top: 12px;
    display: inline-block;
    position: relative;
  }
  .lds-ellipsis div {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 4px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 4px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 16px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 28px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(12px, 0);
    }
  }

  &:hover {
    background-color: var(--background-menu);
    cursor: default;
  }

  > .action {
    height: 100%;
    flex-basis: auto;
    display: flex;
    flex-direction: row;
    column-gap: 1rem;
    padding-left: 1rem;

    button {
      flex-basis: 50%;
      flex-grow: 1;
      border: 1px solid var(--border-mid-color);
    }
    .processing {
      background-color: var(--background-modal);
      color: var(--background-modal);
    }
  }

  > .content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;

    > .inner {
      display: flex;
      align-items: flex-start;

      > .identicon {
        flex-shrink: 1;
        flex-grow: 0;
        position: relative;

        .index-icon {
          background: var(--background-primary);
          border: 1px solid var(--border-primary-color);
          color: var(--text-color-secondary);
          font-family: InterSemiBold, sans-serif;
          border-radius: 50%;
          position: absolute;
          bottom: -0.25rem;
          right: -0.6rem;
          min-width: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.35rem;
          height: 1.75rem;
          width: auto;

          svg {
            color: var(--text-color-primary);
            width: 60%;
            height: 60%;
          }
        }
      }

      > div:last-child {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        flex-grow: 1;

        button {
          margin-left: 0.5rem;
        }

        section {
          width: 100%;
          display: flex;
          padding-left: 1.5rem;

          &.row {
            align-items: center;

            .edit {
              margin-left: 0.75rem;
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
          border: 1px solid var(--border-primary-color);
          background: var(--background-list-item);
          color: var(--text-color-primary);
          border-radius: 0.75rem;
          padding: 0.85rem 0.75rem;
          letter-spacing: 0.04rem;
          font-size: 1rem;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          max-width: 175px;
          transition:
            background-color 0.2s,
            max-width 0.2s,
            padding 0.2s;

          &:focus {
            background: var(--background-menu);
            max-width: 300px;
          }

          &:disabled {
            border: 1px solid var(--background-menu);
            background: none;
          }
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

  .more {
    margin-top: 1rem;
    padding: 0 1.5rem;

    h4 {
      opacity: var(--opacity-disabled);
      padding: 0;
    }
  }
`;
