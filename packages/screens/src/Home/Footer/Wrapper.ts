// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FooterWrapper = styled.div`
  background: var(--background-surface);
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: height 0.7s cubic-bezier(0.15, 1, 0.1, 1);
  position: fixed;
  bottom: 0;
  left: 0;
  height: 3rem;
  overflow: hidden;
  z-index: 20;

  section {
    width: 100%;
  }
  .status {
    height: 3rem;
    display: flex;
    width: 100%;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0 1rem;
    transition: height 0.2s;

    > div:first-of-type,
    h5 {
      color: var(--text-color-secondary);
    }
    > div:nth-of-type(2) {
      flex-grow: 1;
    }
    button {
      padding: 0.25rem 0.5rem 0.25rem 1rem;
      opacity: 0.6;
      &:hover {
        opacity: 1;
      }
    }
    > *:first-child {
      margin-right: 0.5rem;
    }

    > *:last-child {
      margin-right: 0rem;
    }
  }

  &.expanded {
    height: calc(100% - 35px); // minus height of header
    padding-bottom: 1rem;
    border-top: none;

    .status {
      height: 4rem;
    }
  }

  .network-list-wrapper {
    .TopHeading {
      border-bottom: 1px solid var(--border-primary-color);
      margin: 0.75rem 0.2rem 0.2rem !important;
      padding-bottom: 1rem;
      h3 {
        font-size: 1.08rem;
        flex: 1;
      }
      .Spinner {
        position: relative;
        > :first-child {
          position: absolute;
          margin-right: 0.2rem;
          top: 0;
        }
      }
    }
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
    padding: 0.5rem 1rem;
  }

  .success {
    margin-top: -1px;
    color: var(--accent-success);
    font-size: 0.7rem;
    animation: fadeLoopSlow 4s ease-in-out infinite;
  }
  .warn {
    color: var(--accent-warning);
    font-size: 0.85rem;
    animation: fadeLoopSlow 4s ease-in-out infinite;
  }
  @keyframes fadeLoopSlow {
    0%,
    100% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const NetworkItem = styled.div`
  background-color: var(--background-primary);
  display: flex;
  align-items: center;
  column-gap: 0.55rem;

  width: 100%;
  padding: 1rem;
  border-radius: 0.375rem;

  .left {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    padding: 0.25rem 0.5rem;

    > h4 {
      color: var(--text-color-secondary);
      min-width: fit-content;
      font: inherit;
      font-size: 0.98rem;
      font-weight: 400;
    }
  }
  .right {
    display: flex;
    align-items: center;
    column-gap: 0.55rem;

    label {
      color: var(--text-color-primary);
      font-size: 0.9rem;
    }
    .disconnect,
    .connect {
      color: var(--text-color-secondary);
      cursor: pointer;

      > button {
        &:hover {
          color: var(--text-color-primary);
        }
        &:disabled {
          color: var(--text-dimmed);
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
`;

export const SelectRpcWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: end;

  .select-wrapper {
    position: relative;

    .icon-wrapper {
      z-index: 8;
      position: relative;

      .success {
        position: absolute;
        top: 11px;
        left: 12px;
        width: 0.5rem;
        height: 0.5rem;
        margin-right: 0.25rem;
        border-radius: 100%;
        background-color: green;
      }
      .danger {
        position: absolute;
        top: 11px;
        left: 12px;
        margin-right: 0.25rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 100%;
        background-color: red;
      }
    }
    select {
      color: var(--text-color-secondary);
      border: 1px solid var(--border-primary-color);
      transition: background-color 0.15s ease-out;

      width: 225px;
      position: relative;
      background-color: inherit;
      appearance: none;
      padding: 0.5rem 0.5rem 0.5rem 2.5rem;
      border-radius: 0.375rem;
      font-size: 1rem;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
      }
    }
  }
`;
