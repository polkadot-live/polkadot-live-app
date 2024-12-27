// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FlexRow = styled.div`
  background-color: var(--background-window) !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const WcSessionButton = styled.button`
  background-color: var(--button-pink-background);
  color: var(--text-bright);
  padding: 1.05rem 1.5rem;
  margin: 0;
  border-radius: 0.375rem;
  transition: all 0.2s ease-out;
  user-select: none;
  width: 125px;
  height: fit-content;

  &:hover:not(:disabled) {
    filter: brightness(1.2);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
