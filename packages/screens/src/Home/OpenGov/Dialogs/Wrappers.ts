// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { darkTheme } from '@polkadot-live/styles/theme/variables';

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
  font-family: Inter, sans-serif;
  font-weight: 400;
  opacity: 0.75;
  &:hover {
    opacity: 1;
  }
  span {
    font-size: 0.96rem;
  }
`;
