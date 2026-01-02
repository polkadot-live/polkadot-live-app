// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import manifest from './manifest.config.js';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import zip from 'vite-plugin-zip-pack';
import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import { version } from './package.json';
import { join, resolve } from 'node:path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');
const PR = PROJECT_ROOT;

const packageTsconfigPaths: Record<string, string> = {
  '@polkadot-live/contexts': resolve(PR, 'packages/contexts/tsconfig.json'),
  '@polkadot-live/consts': resolve(PR, 'packages/consts/tsconfig.json'),
  '@polkadot-live/core': resolve(PR, 'packages/core/tsconfig.json'),
  '@polkadot-live/encoder': resolve(PR, 'packages/encoder/tsconfig.json'),
  '@polkadot-live/screens': resolve(PR, 'packages/screens/tsconfig.json'),
  '@polkadot-live/styles': resolve(PR, 'packages/styles/tsconfig.json'),
  '@polkadot-live/types': resolve(PR, 'packages/types/tsconfig.json'),
  '@polkadot-live/ui': resolve(PR, 'packages/ui/tsconfig.json'),
};

export default defineConfig({
  // Treat packages as source and not dependencies. Needed for CRX + monorepo.
  optimizeDeps: {
    exclude: [...Object.keys(packageTsconfigPaths)],
  },
  plugins: [
    tsconfigPaths({
      // Ensure Vite resolves paths in packages to understand project structure.
      projects: [
        resolve(__dirname, 'tsconfig.json'),
        ...Object.values(packageTsconfigPaths),
      ],
    }),
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
      allow: [PR],
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
