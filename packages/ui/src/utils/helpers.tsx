// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { LoadingPlaceholderWrapper } from '@polkadot-live/styles/wrappers';

/**
 * @name createArrayWithLength
 * @summary Utility for creating an array of `n` length.
 */
export const createArrayWithLength = (n: number): number[] =>
  [...Array(n + 1)].map((_, i) => i);

/**
 * @name renderPlaceholders
 * @summary Render placeholder loaders.
 */
export const renderPlaceholders = (
  length: number,
  height = '3rem',
  borderRadius = '1.25rem'
) => (
  <LoadingPlaceholderWrapper $height={height} $borderRadius={borderRadius}>
    <div className="placeholder-content-wrapper">
      {createArrayWithLength(length).map((_, i) => (
        <div key={i} className="placeholder-content"></div>
      ))}
    </div>
  </LoadingPlaceholderWrapper>
);
