// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    svgr(),
    react()
  ],
  resolve: {
    alias: [
      {
        find: "@app",
        replacement: resolve(__dirname, "src", "renderer"),
      },{
        find: "@",
        replacement: resolve(__dirname, "src"),
      },
    ]
  }
});
