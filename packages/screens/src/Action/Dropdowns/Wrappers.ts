// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FilterButton = styled.button`
  background-color: var(--background-primary);
  color: var(--text-color-secondary);
  border-radius: 0.375rem;
  align-self: stretch;

  .wrapper {
    display: flex;
    align-self: stretch;
    align-items: center;
    height: 100%;
    justify-content: center;
    padding: 0 1.5rem;
    position: relative;

    .exclaim {
      color: #cd8500;
      font-size: 0.8rem;
      position: absolute;
      top: 11px;
      right: 11px;
    }
  }
  &:hover {
    color: var(--text-color-primary);
    background-color: var(--background-primary-hover);
  }
`;

export const IconButton = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  opacity: 0.75;
  height: 100%;
  font-size: 0.9rem;

  &:hover {
    opacity: 1;
  }
`;
