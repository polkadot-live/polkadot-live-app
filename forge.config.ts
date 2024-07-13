// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { productName } from './package.json';
import path from 'path';
import fs from 'fs';

const rootDir = process.cwd();

const config: ForgeConfig = {
  packagerConfig: {
    // Create asar archive for main, renderer process files.
    asar: true,
    // Set application copyright.
    appCopyright: `Copyright (C) ${new Date().getFullYear()} Polkadot Live Authors & Contributors`,
    // Set executable name.
    executableName: productName,
    // Provide an info.plist to merge with app.
    extendInfo: path.resolve(rootDir, 'entitlements/extendedInfo.plist'),
    // Mac Bundle ID.
    appBundleId: 'com.jkrb.polkadot-live',
    // Set application icon.
    icon: path.resolve(rootDir, 'public/assets/icons/icon'),
    // Keep dev dependencies if in test mode.
    prune: process.env.NODE_ENV !== 'test',
    // The osxSign config comes with defaults that work out of the box in most cases.
    osxSign: {
      optionsForFile: (filePath) => {
        // Here, we keep it simple and return a single entitlements.plist file.
        // You can use this callback to map different sets of entitlements
        // to specific files in your packaged app.
        return {
          entitlements: path.resolve(rootDir, 'entitlements/default.darwin.plist'),
        };
      }
    },
    // Set Apple team ID and associated team member credentials for notaraization.
    osxNotarize: process.env['SKIP_NOTARIZE'] ? undefined : {
      appleId: process.env.APPLE_ID || '',
      appleIdPassword: process.env.APPLE_PASSWORD || '',
      teamId: process.env.APPLE_TEAM_ID || '',
    },
  },
  hooks: {
    packageAfterPrune: async (forgeConfig, buildPath, electronVersion, platform, arch) => {
      if (platform === 'darwin') {
        // We need to remove the problematic link file on macOS.
        fs.unlinkSync(path.join(buildPath, 'node_modules/usb/build/node_gyp_bins/python3'));
      }
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: path.resolve(rootDir, 'public/assets/icons/icon.icns'),
        format: "ULFO"
      }
    }
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'polkadot-live',
          name: 'polkadot-live-app',
        },
        draft: false,
      }
    }
  ],
};

export default config;
