// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// Utility for creating an array of `n` length.
export const createArrayWithLength = (n: number): number[] =>
  [...Array(n + 1)].map((_, i) => i);

/// Render placeholder loaders
export const renderPlaceholders = (length: number) => (
  <div className="placeholder-content-wrapper">
    {createArrayWithLength(length).map((_, i) => (
      <div key={i} className="placeholder-content"></div>
    ))}
  </div>
);
