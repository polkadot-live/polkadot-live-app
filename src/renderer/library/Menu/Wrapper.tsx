// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const MenuWrapper = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 2.75rem;
  z-index: 10;

  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 175px;
  height: auto;
  padding: 0.75rem 0 0;

  box-shadow: -1px 3px 5px 0px var(--card-shadow-color);
  border: 1px solid var(--border-mid-color);
  background: var(--background-menu);
  border-radius: 0.75rem;
  overflow: hidden;
  user-select: none;

  > button,
  > button:disabled {
    font-family: InterSemiBold, sans-serif;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    transition: background 0.15s;
    cursor: pointer;

    &:hover {
      background: var(--button-hover-background);
    }
  }

  > button:disabled {
    color: #636363;
    &:hover {
      background: inherit;
    }
  }

  // Controls
  .controls {
    .controls-wrapper {
      margin-top: 0.75rem;
      border-top: 1px solid #282828;
      border-bottom-left-radius: 0.75rem;
      border-bottom-right-radius: 0.75rem;
      background-color: #1b1b1b;

      padding: 1rem;
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;

      .menu-btn {
        background-color: var(--background-menu);
        border: 1px solid var(--border-mid-color);
        font-size: 1rem;
        font-family: InterSemiBold, sans-serif;
        user-select: none;
        transition: background-color 0.2s ease-out;
        width: 100%;
        color: var(--text-color-secondary);

        &:hover {
          background-color: inherit;
          border: 1px solid var(--border-secondary-color) !important;
        }
      }

      // Connect button
      .connect-wrapper {
        position: relative;
        width: 100%;

        .do-pulse {
          animation: pulse 3s infinite ease-in-out;
        }
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      }
    }
  }
`;

export const Separator = styled.div`
  border-top: 1px solid var(--border-secondary-color);
  width: 100%;
  margin: 0.45rem 0;
`;
