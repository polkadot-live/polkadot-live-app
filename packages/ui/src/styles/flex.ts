// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FlexRow = styled.div<{ $gap: string }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.$gap};
`;

export const FlexRowWrap = styled.div<{
  $columnGap?: string;
  $rowGap?: string;
}>`
  display: flex;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
  row-gap: ${(props) => (props.$rowGap ? props.$rowGap : '0.75rem')};
  column-gap: ${(props) => (props.$columnGap ? props.$columnGap : '1rem')};
`;
