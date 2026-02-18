// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import crypto from 'node:crypto';
import type { AnyData } from '@polkadot-live/types/misc';

// Return SHA256 hash of a string.
export const getSHA256Hash = (val: string) => {
  const hash = crypto.createHash('sha256');
  hash.update(val);
  return hash.digest('hex');
};

// Return true if both sets of data output the same hash.
export const compareHashes = (x: AnyData, y: AnyData) =>
  getSHA256Hash(String(x)) === getSHA256Hash(String(y));

// Generate a random UID
export const getUid = (): string => crypto.randomBytes(16).toString('hex');
