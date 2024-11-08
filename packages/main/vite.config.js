// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';
import { external } from '../../vite.base.config';
import { join } from 'node:path';
import { node } from '../../.electron-vendors.cache.json';
import { resolve } from 'path';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = PACKAGE_ROOT;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config
 */
export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    // List of fields in package.json to try when resolving a package's entry point.
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    // Import aliases.
    alias: [
      {
        find: '@',
        replacement: resolve(PACKAGE_ROOT, 'src'),
      },
      {
        find: '@app',
        replacement: resolve(PACKAGE_ROOT, 'src', 'renderer'),
      },
    ],
  },
  build: {
    ssr: true,
    sourcemap: 'inline',
    target: `node${node}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE !== 'development',
    lib: {
      entry: join(PACKAGE_ROOT, 'src', 'main.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external,
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [eslint(), svgr()],
});
