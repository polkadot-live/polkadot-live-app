// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
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
  let alias = [];
  if (process.env.MODE !== 'development') {
    return alias;
  }

  // Map alias paths to the package.json exports to align development and production.
  const PR = `${PROJECT_ROOT}/packages`;
  const srcUi = resolve(PR, 'ui', 'src');
  const srcCore = resolve(PR, 'core', 'src');
  const srcConsts = resolve(PR, 'consts', 'src');
  const srcContexts = resolve(PR, 'contexts', 'src');
  const srcEncoder = resolve(PR, 'encoder', 'src');
  const srcScreens = resolve(PR, 'screens', 'src');
  const srcStyles = resolve(PR, 'styles', 'src');
  const srcTypes = resolve(PR, 'types', 'src');

  const pfx = '@polkadot-live';
  const devDeps = [
    [`${pfx}/ui/scss/buttons`, `${srcUi}/kits/buttons`],
    [`${pfx}/ui/scss/overlay`, `${srcUi}/kits/overlay`],
    [`${pfx}/ui`, srcUi],
    [`${pfx}/core`, srcCore],
    [`${pfx}/consts`, srcConsts],
    [`${pfx}/contexts`, srcContexts],
    [`${pfx}/encoder`, srcEncoder],
    [`${pfx}/screens`, srcScreens],
    [`${pfx}/styles`, srcStyles],
    [`${pfx}/types`, srcTypes],
  ];

  const devAlias = devDeps.map(([find, path]) => ({
    find,
    replacement: resolve(PROJECT_ROOT, path),
  }));

  return alias.concat(devAlias);
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
      allow: [PROJECT_ROOT],
      strict: true,
    },
  },
  resolve: {
    alias: getAliasConfig(),
    preserveSymlinks: true,
  },
  build: {
    sourcemap: process.env.MODE === 'development',
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
