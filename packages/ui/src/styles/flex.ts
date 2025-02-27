// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const MaxContainer = styled.div`
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;
`;

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

export const ResponsiveRow = styled.div<{ $gap?: string; $smWidth?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => (props.$gap ? props.$gap : '1rem')};

  @media (max-width: ${({ $smWidth }) => ($smWidth ? $smWidth : '450px')}) {
    flex-direction: column;
    align-items: start;

    .SmAlignStretch {
      align-self: stretch;
    }
    .SmAlignStart {
      align-self: start;
    }
  }
`;
