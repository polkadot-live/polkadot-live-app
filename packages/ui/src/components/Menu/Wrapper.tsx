// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const MenuWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 2.25rem;
  z-index: 30;

  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 175px;
  height: auto;
  padding: 0.75rem 0 0;

  box-shadow: -1px 3px 5px 0px var(--card-shadow-color);
  border: 1px solid var(--border-mid-color);
  background: var(--background-surface);
  border-radius: 0.375rem;
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
      background: var(--menu-button-hover);
    }
  }

  > button:disabled {
    color: var(--menu-text-disabled);
    &:hover {
      background: inherit;
    }
  }

  // Controls
  .controls {
    .controls-wrapper {
      background-color: var(--background-primary);
      border-top: 1px solid var(--border-primary-color);
      margin-top: 0.75rem;
      border-bottom-left-radius: 0.75rem;
      border-bottom-right-radius: 0.75rem;

      padding: 1rem;
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;

      .menu-btn {
        color: var(--text-color-secondary);
        background-color: var(--background-surface);
        border: 1px solid var(--border-mid-color);
        font-family: InterSemiBold, sans-serif;
        font-size: 1rem;
        user-select: none;
        width: 100%;
        transition: background-color 0.2s ease-out;

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
