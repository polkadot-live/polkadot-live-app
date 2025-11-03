// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const InfoPanel = styled.div.attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1rem;
  padding: 1rem;
  background-color: ${({ $theme }) => $theme.backgroundPrimary};
  border-radius: 0.375rem;

  > div {
    display: flex;
    width: 100%;
    gap: 0.5rem;
    align-items: center;

    > .LeftItem {
      color: ${({ $theme }) => $theme.textColorPrimary};
    }
    > .RightItem {
      color: ${({ $theme }) => $theme.textColorSecondary};
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: flex-end;
      text-align: right;
    }
  }
`;
