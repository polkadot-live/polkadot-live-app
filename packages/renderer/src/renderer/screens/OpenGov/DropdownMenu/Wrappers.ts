// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

const mixinButton = css`
  background-color: var(--button-background-secondary);
  font-size: 0.85rem;
  height: 24px;
  transition: all 0.2s ease-out;

  .icon {
    color: var(--text-color-primary);
    transition: all 0.15s ease-out;
  }
`;

export const MenuButton = styled.button<{ $dark?: boolean }>`
  ${mixinButton};

  filter: ${(props) => (props.$dark ? 'brightness(70%)' : 'brightness(120%)')};
  border-radius: 0.95rem;
  width: 46px;

  &:hover {
    filter: ${(props) =>
      props.$dark ? 'brightness(90%)' : 'brightness(110%)'};
    .icon {
      color: var(--text-bright);
    }
  }
`;

export const RoundRightButton = styled.button<{ $dark?: boolean }>`
  ${mixinButton};

  filter: ${(props) => (props.$dark ? 'brightness(70%)' : 'brightness(120%)')};
  border-top-right-radius: 0.95rem;
  border-bottom-right-radius: 0.95rem;
  width: 37px;

  &:hover {
    filter: ${(props) =>
      props.$dark ? 'brightness(90%)' : 'brightness(110%)'};
    .icon {
      color: var(--text-bright);
    }
  }
`;

export const RoundLeftButton = styled.button<{ $dark?: boolean }>`
  ${mixinButton};

  filter: ${(props) => (props.$dark ? 'brightness(70%)' : 'brightness(120%)')};
  border-top-left-radius: 0.95rem;
  border-bottom-left-radius: 0.95rem;
  width: 37px;

  &:hover {
    filter: ${(props) =>
      props.$dark ? 'brightness(90%)' : 'brightness(110%)'};
    .icon {
      color: var(--text-bright);
    }
  }
`;
