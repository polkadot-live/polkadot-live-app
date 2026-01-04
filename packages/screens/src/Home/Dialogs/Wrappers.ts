// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { darkTheme } from '@polkadot-live/styles';

export const ChainListWrapper = styled.div.attrs<{
  $theme: typeof darkTheme;
}>((props) => ({
  $theme: props.$theme,
}))`
  color: ${({ $theme }) => $theme.textColorSecondary};
  .ChainItem {
    font-size: 1.05rem;
    padding: 0.5rem 0;
    span {
      font-size: 1.02rem;
    }
  }
  h2 {
    font-size: 1.05rem;
  }
  p {
    margin: 0.5rem 0;
    font-size: 1.05rem;
  }
`;
