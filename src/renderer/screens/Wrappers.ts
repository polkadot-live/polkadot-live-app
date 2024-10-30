// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

// Child window header
export const HeaderWrapper = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 5;
  width: 100%;

  background-color: var(--background-surface);
  border-bottom: 1px solid var(--border-primary-color);

  .content {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem 0.75rem;

    h3,
    h4 {
      font-weight: 600;
      font-size: 1.1rem;
      user-select: none;
    }
    h4 {
      display: flex;
      align-items: center;
      > span {
        color: var(--text-color-primary);
        margin-right: 0%.5rem;
      }
      svg {
        width: 1.1rem;
        height: 1.1rem;
        margin-right: 0.6rem;
        path {
          fill: var(--text-color-primary);
        }
      }
    }
  }
`;

// Action content wrapper
export const ContentWrapper = styled.div`
  width: 100%;
  position: relative;
  padding: 0 1.5rem;
  background-color: var(--background-window);

  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem;
  }

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

export const WindowWrapper = styled.div`
  background-color: var(--background-modal);
  width: 100%;
  position: relative;
  padding: 0 1.5rem;

  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const GridTwoCol = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.25rem;
`;

export const GridFourCol = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.25rem;

  > div:first-of-type {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
  > div:last-of-type {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
`;
