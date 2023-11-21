// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@polkadot-cloud/react';
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
