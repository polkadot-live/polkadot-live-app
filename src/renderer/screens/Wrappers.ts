// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

// action content wrapper
export const ContentWrapper = styled.div`
  width: 100%;
  height: auto;
  overflow: hidden;
  position: relative;
  padding: 1rem 1.5rem;

  .svg-title {
    height: 0.85rem;
    margin: 0.5rem 0 0.75rem;
  }

  h3 {
    font-weight: 600;
    margin: 0.85rem 0 1rem 0;

    &.title {
      font-size: 1.35rem;
      margin: 1.25rem 0 0 0;
    }
  }

  h5 {
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
    opacity: 0.8;
    .icon {
      fill: var(--text-color-primary);
      width: 1.1rem;
      height: 1.1rem;
      margin-right: 0.65rem;
    }
  }

  a {
    color: var(--network-color-primary);
  }
  .header {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 1rem 1rem 0 1rem;
  }
  .body {
    padding: 0.5rem 0;
  }
  .notes {
    padding: 1rem 0;
    > p {
      color: var(--text-color-secondary);
    }
  }
  .action-button {
    background: var(--button-primary-background);
    padding: 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
    border-radius: 0.75rem;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    transition: all var(--transition-duration);
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }

    h3,
    p {
      text-align: left;
      margin: 0;
    }
    h3 {
      margin-bottom: 0.5rem;
    }
    > *:last-child {
      flex: 1;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-end;
    }
    &:hover {
      background: var(--button-hover-background);
    }
    .icon {
      margin-right: 0.5rem;
    }
    p {
      color: var(--text-color-primary);
      font-size: 1rem;
    }
  }
`;
