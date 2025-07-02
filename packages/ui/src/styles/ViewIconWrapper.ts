// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const ViewIconWrapper = styled.div.attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  .ViewIcon {
    cursor: pointer;
    &:hover {
      color: ${({ $theme }) => $theme.textColorPrimary};
    }
  }
`;
