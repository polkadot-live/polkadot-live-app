// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { join, resolve } from 'path';
import { chrome } from '../../.electron-vendors.cache.json';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = PACKAGE_ROOT;

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
  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: '@app',
        replacement: resolve(PACKAGE_ROOT, 'src', 'renderer'),
      },
      {
        find: '@',
        replacement: resolve(PACKAGE_ROOT, 'src'),
      },
    ],
  },
  build: {
    sourcemap: true,
    minify: process.env.MODE !== 'development',
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: join(PACKAGE_ROOT, 'index.html'),
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [react(), svgr()],
});
