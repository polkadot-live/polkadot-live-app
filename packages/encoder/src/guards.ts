// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountId32 } from 'dedot/codecs';
import type { AnyData } from '@polkadot-live/types';

export const isAccountId32 = (v: unknown): v is AccountId32 => {
  if (v instanceof AccountId32) {
    return true;
  }
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as AnyData).address === 'function' &&
    typeof (v as AnyData).eq === 'function'
  );
};
