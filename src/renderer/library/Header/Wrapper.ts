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

    .left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-top: 0.5rem;
      column-gap: 0.5rem;

      .connection-btn-wrapper {
        position: relative;

        .connecting {
          color: var(--background-menu);
        }

        /* 3 Dot Spinner */
        .lds-ellipsis {
          /* change color here */
          color: #afafaf;
        }
        .lds-ellipsis,
        .lds-ellipsis div {
          box-sizing: border-box;
        }
        .lds-ellipsis {
          margin-left: 8px;
          top: 12px;
          display: inline-block;
          position: relative;
        }
        .lds-ellipsis div {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation-timing-function: cubic-bezier(0, 1, 1, 0);
        }
        .lds-ellipsis div:nth-child(1) {
          left: 4px;
          animation: lds-ellipsis1 0.6s infinite;
        }
        .lds-ellipsis div:nth-child(2) {
          left: 4px;
          animation: lds-ellipsis2 0.6s infinite;
        }
        .lds-ellipsis div:nth-child(3) {
          left: 16px;
          animation: lds-ellipsis2 0.6s infinite;
        }
        .lds-ellipsis div:nth-child(4) {
          left: 28px;
          animation: lds-ellipsis3 0.6s infinite;
        }
        @keyframes lds-ellipsis1 {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes lds-ellipsis3 {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(0);
          }
        }
        @keyframes lds-ellipsis2 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(12px, 0);
          }
        }
      }
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
      justify-content: flex-end;

      .switch-wrapper {
        display: flex;
        column-gap: 1rem;
        z-index: 5;
      }
      > button {
        margin-left: 1.4rem;
      }
    }
  }
`;
