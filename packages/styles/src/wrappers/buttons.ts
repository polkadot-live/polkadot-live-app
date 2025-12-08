// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

const mixinButton = css`
  background-color: var(--button-background-primary);
  font-size: 0.85rem;
  height: 24px;
  transition: all 0.2s ease-out;

  .icon {
    color: var(--text-color-primary);
    transition: all 0.15s ease-out;
    opacity: 1;
  }
`;

export const MenuButton = styled.button<{ $dark?: boolean }>`
  ${mixinButton};
  border-radius: 0.15rem;
  width: 46px;

  &:hover {
    background-color: var(--button-background-primary-hover) !important;
  }
  &:disabled {
    cursor: not-allowed;
    .icon {
      opacity: 0.3;
    }
  }
`;
