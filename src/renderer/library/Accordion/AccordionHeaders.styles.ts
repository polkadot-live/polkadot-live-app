// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const HeadingWrapper = styled.div`
  width: 100%;
  padding: 0.5rem 0.75rem;
  z-index: 3;
  opacity: 0.75;
  user-select: none;
  cursor: pointer;

  .flex {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0.5rem;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 1rem;
      padding: 0.5rem;
    }

    .left {
      flex: 1;
      display: flex;
      column-gap: 0.75rem;
      justify-content: flex-start;

      .icon-wrapper {
        min-width: 0.75rem;
        opacity: 0.4;
      }
      h5 {
        > span {
          color: var(--text-color-primary);
        }
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }
`;

export const WideHeadingWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  opacity: 0.75;
  user-select: none;
  cursor: pointer;

  .flex {
    padding: 0.25rem 0;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);
    transition: background-color 0.15s ease-in-out;

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      column-gap: 1rem;
      padding: 0.5rem;
    }
    .left {
      display: flex;
      justify-content: flex-start;
      flex: 1;

      .icon-wrapper {
        min-width: 0.75rem;
        opacity: 0.4;
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }

  h5 {
    display: flex;
    align-items: flex-end;
  }

  .icon {
    fill: var(--text-color-primary);
    width: 0.95rem;
    height: 0.95rem;
    margin-right: 0.6rem;
  }
`;
