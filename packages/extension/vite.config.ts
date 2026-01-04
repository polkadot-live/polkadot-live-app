// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import manifest from './manifest.config.js';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import zip from 'vite-plugin-zip-pack';
import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import { version } from './package.json';
import { join, resolve } from 'node:path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

const packageNames: string[] = [
  '@polkadot-live/contexts',
  '@polkadot-live/consts',
  '@polkadot-live/core',
  '@polkadot-live/encoder',
  '@polkadot-live/screens',
  '@polkadot-live/styles',
  '@polkadot-live/types',
  '@polkadot-live/ui',
];

const getAliasConfig = () => {
  if (process.env.MODE === 'production') {
    return [];
  }
  const alias = (find: string, path: string) => ({
    find,
    replacement: resolve(__dirname, path),
  });

  const pfx = '@polkadot-live'
  return [
    alias(`${pfx}/consts`, '../consts/src'),
    alias(`${pfx}/core`, '../core/src'),
    alias(`${pfx}/contexts`, '../contexts/src'),
    alias(`${pfx}/encoder`, '../encoder/src'),
    alias(`${pfx}/screens`, '../screens/src'),
    alias(`${pfx}/types`, '../types/src'),

    alias(`${pfx}/ui/scss/buttons`, '../ui/src/kits/buttons'),
    alias(`${pfx}/ui/scss/overlay`, '../ui/src/kits/overlay'),
    alias(`${pfx}/ui/svg`, '../ui/src/svg'),
    alias(`${pfx}/ui`, '../ui/src'),

    alias(`${pfx}/styles/accents`, '../styles/src/accents'),
    alias(`${pfx}/styles/partials`, '../styles/src/partials'),
    alias(`${pfx}/styles/theme`, '../styles/src/theme'),
    alias(`${pfx}/styles`, '../styles/src'),
  ];
};

export default defineConfig({
  resolve: {
    alias:  getAliasConfig(),
  },
  // Treat packages as source and not dependencies. Needed for CRX + monorepo.
  optimizeDeps: {
    exclude: packageNames,
  },
  plugins: [
    nodePolyfills(),
    react(),
    svgr(),
    crx({ manifest }),
    zip({
      outDir: resolve(__dirname, 'release'),
      outFileName: `polkadot-live-${version}.zip`,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        tab: resolve(__dirname, 'src/tab/index.html'),
      },
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: 'src/[name]/index.js', // Bundle JS for tab into dist/src/tab/index.js
      },
    },
    emptyOutDir: true,
    outDir: 'dist',
  },
  server: {
    fs: {
      allow: [PROJECT_ROOT],
    },
    hmr: {
      protocol: 'ws', // Use WebSocket for HMR
      host: 'localhost', // Host for HMR WebSocket
      port: 3000, // Ensure this matches your Vite dev server port
      clientPort: 3000, // Vite client port for HMR
      path: '/', // Path for HMR connection
    },
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
