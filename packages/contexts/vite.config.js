// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import pkg from './package.json';
import pkgRoot from '../../package.json';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { join } from 'path';
import { chrome } from '../../.electron-vendors.cache.json';

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
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      // Each item controls output file names.
      entry: {
        index: join(PACKAGE_ROOT, 'src/index.ts'),
        'types/action': join(PACKAGE_ROOT, 'src/types/action/index.ts'),
        'types/common': join(PACKAGE_ROOT, 'src/types/common/index.ts'),
        'types/import': join(PACKAGE_ROOT, 'src/types/import/index.ts'),
        'types/main': join(PACKAGE_ROOT, 'src/types/main/index.ts'),
        'types/openGov': join(PACKAGE_ROOT, 'src/types/openGov/index.ts'),
        'types/settings': join(PACKAGE_ROOT, 'src/types/settings/index.ts'),
        'types/tabs': join(PACKAGE_ROOT, 'src/types/tabs/index.ts'),
      },
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
  ],
});
