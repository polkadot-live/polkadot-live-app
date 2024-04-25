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
  padding: 0.45rem 0;

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
`;

export const Separator = styled.div`
  border-top: 1px solid var(--border-secondary-color);
  width: 100%;
  margin: 0.45rem 0;
`;
