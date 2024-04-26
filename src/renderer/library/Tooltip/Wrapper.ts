// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const Wrapper = styled.div`
  background: var(--background-modal);
  border: 1px solid var(--border-mid-color);
  color: #fff;
  transition: opacity var(--transition-duration);
  display: flex;
  flex-flow: row wrap;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  min-width: 100px;
  z-index: 99;

  h3 {
    width: 100%;
    color: var(--text-color-primary);
    font-family: InterSemiBold, sans-serif;
    font-size: 0.9rem;
    padding: 0;
    text-align: center;
  }
`;
