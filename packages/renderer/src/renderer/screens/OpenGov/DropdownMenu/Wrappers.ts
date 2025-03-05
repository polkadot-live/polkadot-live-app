// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

const mixinButton = css`
  background-color: var(--button-background-secondary);
  font-size: 0.85rem;
  height: 24px;
  transition: all 0.2s ease-out;
  filter: brightness(70%);

  .icon {
    color: var(--text-color-primary);
    transition: all 0.15s ease-out;
  }

  &:hover {
    filter: brightness(90%);
    .icon {
      color: var(--text-bright);
      filter: brightness(100%);
    }
  }
`;

export const MenuButton = styled.button`
  ${mixinButton};
  border-radius: 0.95rem;
  width: 46px;
`;

export const RoundRightButton = styled.button`
  ${mixinButton};

  border-top-right-radius: 0.95rem;
  border-bottom-right-radius: 0.95rem;
  width: 37px;
`;

export const RoundLeftButton = styled.button`
  ${mixinButton};

  border-top-left-radius: 0.95rem;
  border-bottom-left-radius: 0.95rem;
  width: 37px;
`;
