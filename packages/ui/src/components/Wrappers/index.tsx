// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MaxContainer, Scrollable } from '../../styles';

export interface ScrollableMaxProps {
  children: React.ReactNode;
  footerHeight?: number;
  headerHeight?: number;
  style?: React.CSSProperties;
}

export const ScrollableMax = ({
  children,
  footerHeight,
  headerHeight,
  style,
}: ScrollableMaxProps) => (
  <Scrollable
    $footerHeight={footerHeight}
    $headerHeight={headerHeight}
    style={{ ...style, alignSelf: 'stretch' }}
  >
    <MaxContainer>{children}</MaxContainer>
  </Scrollable>
);
