// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const Wrapper = styled.div`
  background: var(--background-window);
  border: 1px solid var(--border-mid-color);
  transition: opacity var(--transition-duration);
  display: flex;
  flex-flow: row wrap;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  min-width: 100px;
  z-index: 99;

  h3 {
    color: var(--text-color-primary);
    width: 100%;
    font-family: InterSemiBold, sans-serif;
    font-size: 0.9rem;
    padding: 0;
    text-align: center;
  }
`;
