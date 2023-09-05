// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 5;
  height: 2.5rem;
  width: 100%;

  > div {
    height: 2.5rem;
    &:first-child {
      -webkit-app-region: drag;
      flex-grow: 1;
    }
    &:last-child {
      padding-top: 0.5rem;

      > button {
        padding: 0.25rem 1.25rem 0.25rem 1rem;
        z-index: 999;
      }
    }
  }
`;
