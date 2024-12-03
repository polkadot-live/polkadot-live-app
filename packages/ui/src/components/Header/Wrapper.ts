// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const HeaderWrapper = styled.div`
  --header-height: 3rem;
  height: var(--header-height);
  background-color: var(--background-surface);
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 1.15rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;

  .content-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;

    .alpha {
      color: var(--badge-alpha-color);
      background-color: var(--badge-alpha-background);
      position: absolute;
      top: 0.5rem;
      left: 0;
      height: 18px;
      padding: 0.2rem 1.2rem;
      opacity: 0.85;
      font-size: 0.85rem;
      letter-spacing: 0.05rem;
      border-radius: 1.5rem;
      user-select: none;
    }

    .grab {
      height: 2rem;
      display: flex;
      flex: 1;
      -webkit-app-region: drag;
      cursor: grab;
    }
    > .right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 0.5rem;
      column-gap: 0.5rem;

      .controls-wrapper {
        display: flex;
        column-gap: 1rem;
        z-index: 5;
        align-items: center;
        position: relative;

        .hide-text {
          color: rgba(0, 0, 0, 0);
        }
        .theme-toggle {
          svg {
            width: 1.6rem;
            height: 1.6rem;
            margin-top: 2px;
            margin-right: -2px;
          }
        }
        .dock-btn {
          border: 1px solid var(--border-mid-color);
          min-width: 96px;
          font-size: 0.85rem;
          max-height: 18px;
          user-select: none;
          transition: background-color 0.2s ease-out;
          transition: opacity 0.2s ease-out;
          opacity: 0.4;

          &:hover {
            background-color: inherit;
            opacity: 0.75;
            border: 1px solid var(--border-secondary-color);
          }
        }
      }
      > button {
        margin-left: 1.4rem;
      }
    }
  }
`;
