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
