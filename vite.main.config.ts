// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from './vite.base.config';
import { resolve } from 'path'
import eslint from 'vite-plugin-eslint';
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);
  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        // TODO: Check if 'usb', 'node-hid', 'socket.io' work.
        external,
      },
    },
    plugins: [pluginHotRestart('restart'), eslint(), svgr()],
    define,
    resolve: {
      // Load the Node.js entry.
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
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
