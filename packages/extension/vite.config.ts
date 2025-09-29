// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import manifest from './manifest.config.js';
import react from '@vitejs/plugin-react';
import zip from 'vite-plugin-zip-pack';
import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import { version } from './package.json';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@ext': `${resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    react(),
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
