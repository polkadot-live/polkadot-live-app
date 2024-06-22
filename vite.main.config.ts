// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path'
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'usb',
        'node-hid',
        'socket.io',
      ]
    }
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "./src"),
      },
      {
        find: "@app",
        replacement: resolve(__dirname, "./src/renderer"),
      },
    ],
  },
  plugins: [ 
    eslint(),
    svgr(),
  ],
});
