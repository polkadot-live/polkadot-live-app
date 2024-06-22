// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const HeaderWrapper = styled.div`
  --header-height: 3rem;
  height: var(--header-height);
  background-color: var(--background-menu);
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 1.15rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;

  .content-wrapper {
    display: flex;
    align-items: center;
    width: 100%;

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
            border: 1px solid var(--border-secondary-color) !important;
            opacity: 0.8;
          }
        }
      }
      > button {
        margin-left: 1.4rem;
      }
    }
  }
`;
