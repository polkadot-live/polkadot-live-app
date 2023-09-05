// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const HeaderWrapper = styled.div`
  --header-height: 3rem;
  height: var(--header-height);
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 1.15rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;

  > div {
    &:first-child {
      height: 2rem;
      display: flex;
      flex-grow: 1;
      justify-content: flex-start;
      padding-right: 1.25rem;
      -webkit-app-region: drag;
      cursor: grab;
      border-radius: 1.5rem;
    }
    &:last-child {
      display: flex;
      justify-content: flex-end;

      > button {
        margin-left: 1.4rem;
      }
    }
  }
`;
