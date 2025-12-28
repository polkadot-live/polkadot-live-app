// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountId32 } from 'dedot/codecs';
import type { Encoder } from './types';

export const bigintEncoder: Encoder<bigint> = {
  tag: 'BigInt',
  encode: (value) => value.toString(),
};

export const numberEncoder: Encoder<number> = {
  tag: 'Number',
  encode: (value) => value.toString(),
};

export const accountId32Encoder: Encoder<AccountId32> = {
  tag: 'AccountId32',
  encode: (value, ctx) => value.address(ctx.ss58Prefix),
};

export const booleanEncoder: Encoder<boolean> = {
  tag: 'Boolean',
  encode: (value) => (value ? 'Yes' : 'No'),
};
