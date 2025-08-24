// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as ToggleGroup from '@radix-ui/react-toggle-group';
import styled from 'styled-components';

export const ToggleGroupRoot = styled(ToggleGroup.Root)`
  --border-radius: 0.375rem;

  height: 100%;
  display: inline-flex;
  align-items: center;
  padding-left: 1rem;

  .ToggleGroupItem {
    background-color: var(--button-background-primary);
    color: var(--text-color-secondary);
    margin-top: -4px;
    display: flex;
    align-items: center;
    min-width: 34px;
    height: 30px;
    justify-content: center;
    margin-left: 1px;
    user-select: none;
  }
  .ToggleGroupItem:first-child {
    margin-left: 0;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }
  .ToggleGroupItem:last-child {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
  .ToggleGroupItem:hover {
    background-color: var(--button-background-primary-hover);
  }
  .ToggleGroupItem[data-state='on'] {
    background-color: var(--button-background-primary-hover);
  }
  .ToggleGroupItem:focus {
    position: relative;
  }
`;
