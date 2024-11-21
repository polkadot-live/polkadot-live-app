// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    testTimeout: 30_000,
    hookTimeout: 30_000,

    /**
     * Import vitest functions in every test file.
     */
    globals: true,

    /**
     * Initialise RTL before test suite executes.
     */
    setupFiles: ['tests/vitest-setup.ts'],
  },
});
