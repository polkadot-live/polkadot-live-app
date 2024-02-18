// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createHash } from 'node:crypto';
import type { AnyData } from '@/types/misc';

// Return SHA256 hash of a string.
export const getSHA256Hash = (val: string) => {
  const hash = createHash('sha256');
  hash.update(val);
  return hash.digest('hex');
};

// Return true if both sets of data output the same hash.
export const compareHashes = (x: AnyData, y: AnyData) =>
  getSHA256Hash(String(x)) === getSHA256Hash(String(y));
