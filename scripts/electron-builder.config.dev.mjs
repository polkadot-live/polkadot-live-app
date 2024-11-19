// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { findFilesThatShouldBeExcluded } from './build-helpers.mjs';

/**
 * Export electron-builder config.
 */
export default {
  /** Metadata */
  appId: 'com.jkrb.polkadot-live',
  asar: true,
  compression: 'normal',
  copyright: `Copyright (C) ${new Date().getFullYear()} Polkadot Live Authors & Contributors`,
  productName: 'Polkadot Live',
  /** Building */
  directories: {
    output: 'releases',
    buildResources: 'packages/renderer/dist',
  },
  files: [
    'packages/main/dist',
    'packages/preload/dist',
    'packages/renderer/dist',
    'package.json',
    ...(await findFilesThatShouldBeExcluded()),
  ],
  npmRebuild: true,
  /** Mac */
  dmg: {
    sign: false,
  },
  mac: {
    entitlements: 'entitlements/entitlements.mac.inherit.plist',
    forceCodeSigning: false,
    gatekeeperAssess: false,
    hardenedRuntime: true,
    icon: 'assets/icon.icns',
    notarize: false,
    target: [
      {
        target: 'dmg',
        arch: ['arm64'],
      },
    ],
  },
  /** Windows */
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: false,
  },
  win: {
    icon: 'assets/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
};
