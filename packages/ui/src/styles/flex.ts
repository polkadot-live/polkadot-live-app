// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FlexRow = styled.div<{ $gap: string }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.$gap};
`;
