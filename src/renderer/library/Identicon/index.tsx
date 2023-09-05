// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Identicon as IdenticonDefault } from '@polkadot/react-identicon';
import styled from 'styled-components';
import { IdenticonProps } from './types';

const Wrapper = styled.div`
  svg > circle:first-child {
    fill: var(--border-primary-color);
  }
`;

export const Identicon = ({ value, size }: IdenticonProps) => (
  <Wrapper style={{ width: `${size}px`, height: `${size}px` }}>
    <IdenticonDefault
      value={value}
      size={size}
      theme="polkadot"
      style={{ cursor: 'default' }}
    />
  </Wrapper>
);
