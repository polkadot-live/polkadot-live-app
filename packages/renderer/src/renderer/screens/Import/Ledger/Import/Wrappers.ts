// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Select from '@radix-ui/react-select';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const ConnectButton = styled.button`
  background-color: var(--button-pink-background);
  color: var(--text-bright);
  padding: 0 1.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-out;
  user-select: none;

  &:hover:not(:disabled) {
    filter: brightness(1.2);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
