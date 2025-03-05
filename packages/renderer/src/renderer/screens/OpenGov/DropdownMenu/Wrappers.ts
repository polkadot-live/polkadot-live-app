// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const MenuButton = styled.button`
  background-color: var(--button-background-secondary);
  font-size: 1rem;
  border-radius: 0.8rem;
  width: 46px;
  height: 21px;

  .icon {
    color: var(--text-color-primary);
    transition: all 0.15s ease-out;
  }

  &:hover {
    filter: brightness(110%);
    .icon {
      color: var(--text-bright);
      filter: brightness(110%);
    }
  }
`;
