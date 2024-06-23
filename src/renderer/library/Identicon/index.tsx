// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@app/library/Polkicon';
import styled from 'styled-components';
import type { IdenticonProps } from './types';

const Wrapper = styled.div`
  svg > circle:first-child {
    fill: var(--border-primary-color);
  }
`;

export const Identicon = ({ value, size }: IdenticonProps) => (
  <Wrapper style={{ width: `${size}px`, height: `${size}px` }}>
    <Polkicon address={value} size={size} />
  </Wrapper>
);
