// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

// The outer-most component wrapping the app.
export const MainInterfaceWrapper = styled.div`
  background: var(--background-modal);
  color: var(--text-color-primary);
  align-items: center;
  border-radius: 10px;
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  height: 100vh;
  width: 100%;
`;

// A component that consumes the height of the window, can sit in-between the header and footer.
export const BodyInterfaceWrapper = styled.div<{
  $maxHeight?: boolean;
}>`
  max-height: ${(props) => (props.$maxHeight ? '100vh' : 'auto')};
  width: 100%;
  max-width: 100%;
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
  position: relative;

  .app-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80%;

    > p {
      font-size: 1.2rem;
      text-align: center;
      color: var(--text-color-primary);
      margin-top: 20px;
    }

    /* Spinner 2 */
    .lds-grid {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }
    .lds-grid div {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--text-color-secondary);
      animation: lds-grid 1.2s linear infinite;
    }
    .lds-grid div:nth-child(1) {
      top: 8px;
      left: 8px;
      animation-delay: 0s;
    }
    .lds-grid div:nth-child(2) {
      top: 8px;
      left: 32px;
      animation-delay: -0.4s;
    }
    .lds-grid div:nth-child(3) {
      top: 8px;
      left: 56px;
      animation-delay: -0.8s;
    }
    .lds-grid div:nth-child(4) {
      top: 32px;
      left: 8px;
      animation-delay: -0.4s;
    }
    .lds-grid div:nth-child(5) {
      top: 32px;
      left: 32px;
      animation-delay: -0.8s;
    }
    .lds-grid div:nth-child(6) {
      top: 32px;
      left: 56px;
      animation-delay: -1.2s;
    }
    .lds-grid div:nth-child(7) {
      top: 56px;
      left: 8px;
      animation-delay: -0.8s;
    }
    .lds-grid div:nth-child(8) {
      top: 56px;
      left: 32px;
      animation-delay: -1.2s;
    }
    .lds-grid div:nth-child(9) {
      top: 56px;
      left: 56px;
      animation-delay: -1.6s;
    }
    @keyframes lds-grid {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;
