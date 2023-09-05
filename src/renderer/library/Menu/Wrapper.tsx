// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const MenuWrapper = styled.div`
  box-shadow: -1px 3px 5px 0px var(--card-shadow-color);
  border: 1px solid var(--border-primary-color);
  background: var(--background-menu);
  border-radius: 0.75rem;
  width: 175px;
  height: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  position: absolute;
  right: 0.75rem;
  top: 2.75rem;
  z-index: 10;
  padding: 0.45rem 0;
  overflow: hidden;

  > button {
    font-family: InterSemiBold, sans-serif;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    transition: background 0.15s;
    &:hover {
      background: var(--button-hover-background);
    }
  }
`;

export const Separator = styled.div`
  border-top: 1px solid var(--border-secondary-color);
  width: 100%;
  margin: 0.45rem 0;
`;
