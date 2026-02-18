// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 40_000,
    hookTimeout: 40_000,

    /**
     * Import vitest functions in every test file.
     */
    globals: true,
  },
});
