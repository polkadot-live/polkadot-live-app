// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { join } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { chrome } from '../../.electron-vendors.cache.json';
import pkgRoot from '../../package.json';
import pkg from './package.json';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');
const isProd = process.env.MODE !== 'development';

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  base: './',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      // Each item controls output file names.
      entry: join(PACKAGE_ROOT, 'src/index.ts'),
      formats: ['es'],
      fileName: (format) => `index.${format}.js`,
    },
    reportCompressedSize: false,
    minify: isProd,
    rollupOptions: {
      // Exclude dependencies from the bundle.
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkgRoot.dependencies || {}),
        ...Object.keys(pkgRoot.peerDependencies || {}),
      ],
      output: {
        dir: 'dist',
        entryFileNames: '[name].[format].js',
      },
    },
    sourcemap: !isProd,
    target: `chrome${chrome}`,
  },
  plugins: [
    dts({
      tsconfigPath: join(PACKAGE_ROOT, 'tsconfig.json'),
      rollupTypes: true,
    }),
  ],
});
