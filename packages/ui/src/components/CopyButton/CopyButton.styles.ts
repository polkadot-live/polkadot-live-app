// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const CopyButtonWrapper = styled.button<{
  $fontSize?: string;
}>`
  font-size: ${(props) => (props.$fontSize ? props.$fontSize : '1.15rem')};
  &:hover {
    filter: brightness(130%);
  }
`;
