// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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

      .switch-wrapper {
        display: flex;
        column-gap: 1rem;
        z-index: 5;
        align-items: center;
        position: relative;

        .connect-btn {
          border: 1px solid var(--border-mid-color);
          min-width: 96px;
          font-size: 0.85rem;
          max-height: 18px;
          user-select: none;
        }
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

        .doPulse {
          animation: 'pulse 3s infinite ease-in-out';
        }
      }
      > button {
        margin-left: 1.4rem;
      }
    }
  }
`;
