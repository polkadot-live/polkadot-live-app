// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FlexColumn = styled.div<{ $columnGap?: string; $rowGap?: string }>`
  display: flex;
  flex-direction: column;
  column-gap: ${(props) => (props.$columnGap ? props.$columnGap : '1rem')};
  row-gap: ${(props) => (props.$rowGap ? props.$rowGap : '1rem')};
`;

export const FlexRow = styled.div<{ $gap: string }>`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$gap ? props.$gap : '1rem')};
`;

export const FlexRowWrap = styled.div<{
  $columnGap?: string;
  $rowGap?: string;
}>`
  display: flex;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
  column-gap: ${(props) => (props.$columnGap ? props.$columnGap : '1rem')};
  row-gap: ${(props) => (props.$rowGap ? props.$rowGap : '0.75rem')};
`;
