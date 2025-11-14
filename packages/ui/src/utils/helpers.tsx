// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name createArrayWithLength
 * @summary Utility for creating an array of `n` length.
 */
export const createArrayWithLength = (n: number): number[] =>
  [...Array(n + 1)].map((_, i) => i);
