// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { darkTheme } from '@polkadot-live/styles';

export const ReferendaListWrapper = styled.div.attrs<{
  $theme: typeof darkTheme;
}>((props) => ({
  $theme: props.$theme,
}))`
  color: ${({ $theme }) => $theme.textColorSecondary};
  .RefItem {
    font-size: 1.05rem;
    padding: 0.5rem 0;
  }
  h2 {
    font-size: 1.05rem;
  }
  p {
    margin: 0.5rem 0;
    font-size: 1.05rem;
  }
`;

export const GearTriggerWrapper = styled.div`
  color: var(--text-color-primary);
  display: flex;
  align-items: center;
  padding: 0;
  font-family: Inter, sans-serif;
  font-weight: 400;
  opacity: 0.75;
  height: 100%;

  .GearIcon {
    color: var(--text-color-secondary);
  }
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 2rem;
    height: 100%;
    cursor: pointer;

    &:hover {
      .GearIcon {
        color: var(--text-color-primary);
      }
    }
  }
`;
