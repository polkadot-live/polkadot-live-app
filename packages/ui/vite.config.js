// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { join } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import { chrome } from '../../.electron-vendors.cache.json';
import pkgRoot from '../../package.json';
import pkg from './package.json';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  base: './',
  server: { fs: { strict: true } },
  build: {
    emptyOutDir: true,
    lib: {
      entry: join(PACKAGE_ROOT, 'src/index.ts'),
      formats: ['es'],
      fileName: (format) => `index.${format}.js`,
    },
    minify: process.env.MODE === 'production',
    reportCompressedSize: false,
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
    sourcemap: process.env.MODE !== 'production',
    target: `chrome${chrome}`,
  },
  plugins: [
    dts({
      tsconfigPath: join(PACKAGE_ROOT, 'tsconfig.json'),
      rollupTypes: true,
    }),
    react(),
    svgr(),
    viteStaticCopy({
      targets: [
        {
          src: join(PACKAGE_ROOT, 'src/kits/buttons/**/*.scss').replace(
            /\\/g,
            '/',
          ),
          dest: 'scss/buttons',
        },
        {
          src: join(PACKAGE_ROOT, 'src/kits/overlay/**/*.scss').replace(
            /\\/g,
            '/',
          ),
          dest: 'scss/overlay',
        },
        {
          src: join(PACKAGE_ROOT, 'src/svg/*.svg').replace(/\\/g, '/'),
          dest: 'svg',
        },
        {
          src: join(PACKAGE_ROOT, 'src/svg/ledger/*.svg').replace(/\\/g, '/'),
          dest: 'svg/ledger',
        },
      ],
    }),
  ],
});
