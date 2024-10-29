// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';

// The outer-most component wrapping the app.
export const MainInterfaceWrapper = styled.div`
  background: var(--background-modal);
  color: var(--text-color-primary);
  align-items: center;
  //border-radius: 10px;
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  height: 100vh;
  width: 100%;

  .Toastify__toast {
    font-size: 1.15rem;
    color: var(--text-color-primary);
    background-color: var(--background-modal);
    border: 1px solid var(--border-mid-color);
    border-radius: 1rem;
    margin: 0.5rem;
    margin-top: 0.75rem;
    max-width: 97%;
  }
`;

// A component that consumes the height of the window, can sit in-between the header and footer.
export const BodyInterfaceWrapper = styled.div<{
  $maxHeight?: boolean;
}>`
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
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;
