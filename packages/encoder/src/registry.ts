// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isAccountId32 } from './guards';
import {
  accountId32Encoder,
  bigintEncoder,
  booleanEncoder,
  numberEncoder,
} from './encoders';
import type { AccountId32 } from 'dedot/codecs';
import type { EncoderEntry } from './types';

// IMPORTANT: order matters. More specific guards must come before general ones.

export const encoders: EncoderEntry[] = [
  {
    guard: (v): v is bigint => typeof v === 'bigint',
    encoder: bigintEncoder,
  },
  {
    guard: (v): v is number => typeof v === 'number',
    encoder: numberEncoder,
  },
  {
    guard: (v): v is boolean => typeof v === 'boolean',
    encoder: booleanEncoder,
  },
  {
    guard: (v): v is AccountId32 => isAccountId32(v),
    encoder: accountId32Encoder,
  },
];
