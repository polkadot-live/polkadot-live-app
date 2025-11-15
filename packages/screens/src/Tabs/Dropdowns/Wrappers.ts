// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const TriggerBtn = styled.button`
  background-color: var(--button-background-primary);
  color: var(--text-color-secondary);
  border-radius: 0.375rem;
  margin-top: -4px;
  display: flex;
  align-items: center;
  min-width: 34px;
  height: 30px;
  justify-content: center;
  user-select: none;
  &:hover {
    background-color: var(--button-background-primary-hover);
  }
`;
