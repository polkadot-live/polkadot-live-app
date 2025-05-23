// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 5_000,
    hookTimeout: 5_000,

    /**
     * Import vitest functions in every test file.
     */
    globals: true,
  },
});
