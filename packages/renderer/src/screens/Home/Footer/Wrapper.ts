// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FooterWrapper = styled.div`
  background: var(--background-surface);
  border-top: 1px solid var(--border-primary-color);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: height 0.7s cubic-bezier(0.15, 1, 0.1, 1);
  position: fixed;
  bottom: 0;
  left: 0;
  height: 3rem;
  overflow: hidden;
  padding-top: 0.5rem;
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

    > div:first-of-type {
      flex-grow: 1;
    }

    button {
      padding: 0.25rem 0.5rem 0.25rem 1rem;
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
    border-top: none;

    .status {
      height: 4rem;
    }
  }

  .network-list-wrapper {
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
      margin-left: 0.25rem;
    }
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
    padding: 0.5rem 1rem;
  }
`;

export const NetworkItem = styled.div`
  background-color: var(--background-window);
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
    column-gap: 0.55rem;
    padding: 0 0.5rem;

    > h4 {
      min-width: 75px;
      font-size: 1rem;
    }
    > .icon {
      width: 1.2rem;
      height: 1.2rem;
      margin-right: 0.5rem;
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
      color: var(--text-color-primary);
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
    }
  }
`;
