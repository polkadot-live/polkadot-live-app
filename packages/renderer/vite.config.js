// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { join, resolve } from 'path';
import { chrome } from '../../.electron-vendors.cache.json';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

/**
 * @name getAliasConfig
 *
 * If we are in development mode, we need to enable HMR for monorepo packages
 * that the renderer imports in the project.
 *
 * This can be accomplished by mapping aliases to resolve package paths
 * directly to their local source folder. We only want this behaviour in
 * development mode. The path should resolve to the `node_modules`
 * version in production.
 *
 * Example syntax:
 * {
 *    find: 'package-name',
 *    replacement: resolve(PROJECT_ROOT, 'packages/<package-name>/dist/mjs'),
 *  }
 */

const getAliasConfig = () => {
  let alias = [
    {
      find: '@app',
      replacement: resolve(PACKAGE_ROOT, 'src', 'renderer'),
    },
    {
      find: '@ren',
      replacement: resolve(PACKAGE_ROOT, 'src'),
    },
  ];

  if (process.env.MODE === 'development') {
    // Map alias paths to the package.json exports to align development and production.
    const srcUi = resolve(PROJECT_ROOT, 'packages', 'ui', 'src');

    const devDeps = [
      ['@polkadot-live/ui/kits/overlay', `${srcUi}/kits/Overlay/index.ts`],
      ['@polkadot-live/ui/kits/buttons', `${srcUi}/kits/Buttons/index.ts`],
      ['@polkadot-live/ui/utils', `${srcUi}/utils`],
      ['@polkadot-live/ui/styles', `${srcUi}/styles`],
      ['@polkadot-live/ui/hooks', `${srcUi}/hooks`],
      ['@polkadot-live/ui/contexts', `${srcUi}/contexts`],
      ['@polkadot-live/ui/components', `${srcUi}/components`],
      ['@polkadot-live/ui/scss/buttons', `${srcUi}/kits/Buttons`],
      ['@polkadot-live/ui/scss/overlay', `${srcUi}/kits/Overlay`],
      ['@polkadot-live/ui', srcUi],
    ];

    const devAlias = devDeps.map(([find, path]) => ({
      find,
      replacement: resolve(PROJECT_ROOT, path),
    }));

    alias = alias.concat(devAlias);
  }

  return alias;
};

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
    alias: getAliasConfig(),
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
