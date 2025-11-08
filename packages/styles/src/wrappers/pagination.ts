// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { styled } from 'styled-components';

export const PaginationRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  user-select: none;
  flex-wrap: wrap;

  .ellipsis {
    color: var(--text-dimmed);
    margin: 0 0.5rem;
  }
  .btn {
    background-color: var(--background-surface);
    border: 1px solid var(--background-surface);
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease-out;
    min-width: 34px;
    cursor: pointer;

    &:hover:not(.disable):not(.selected):not(.fetching) {
      background-color: var(--background-primary);
    }
    &.selected {
      background-color: var(--background-primary);
      color: var(--text-active);
    }
    &.middle {
      border: 1px solid var(--border-subtle);
    }
    &:disabled {
      color: var(--text-dimmed);
      cursor: not-allowed;
    }
    &.placeholder {
      color: var(--text-dimmed);
      width: 31.75px;
      align-self: stretch;
      position: relative;
      cursor: not-allowed;
      .icon {
        position: absolute;
        bottom: 2px;
        left: 10px;
      }
    }
    &.fetching {
      cursor: not-allowed;
    }
    .exclaim {
      color: #cd8500;
      font-size: 0.75rem;
      position: absolute;
      top: 4px;
      right: 8px;
    }
  }
`;
