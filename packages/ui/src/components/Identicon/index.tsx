// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@w3ux/react-polkicon';
import styled from 'styled-components';
import type { IdenticonProps } from './types';

const Wrapper = styled.div`
  svg > circle:first-child {
    fill: var(--border-primary-color);
  }
`;

export const Identicon = ({ value, fontSize = '2rem' }: IdenticonProps) => (
  <Wrapper>
    <Polkicon address={value} fontSize={fontSize} />
  </Wrapper>
);
