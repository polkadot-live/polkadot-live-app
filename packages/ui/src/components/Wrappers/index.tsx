// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MaxContainer, Scrollable } from '@polkadot-live/styles/wrappers';

export interface ScrollableMaxProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const ScrollableMax = ({ children, style }: ScrollableMaxProps) => (
  <Scrollable style={{ ...style }}>
    <MaxContainer
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {children}
    </MaxContainer>
  </Scrollable>
);
