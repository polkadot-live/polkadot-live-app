// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

const resources =
  process.env.NODE_ENV === 'production'
    ? ['src/tab/index.js']
    : ['src/tab/index.html', 'src/tab/*'];

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    16: 'public/icon-16.png',
    32: 'public/icon-32.png',
    48: 'public/icon-48.png',
    128: 'public/icon-128.png',
  },
  action: {
    default_icon: {
      48: 'public/icon-48.png',
    },
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  host_permissions: [
    'https://api.polkassembly.io/*',
    'http://localhost/*',
    'https://localhost/*',
  ],
  permissions: [
    'activeTab',
    'management',
    'notifications',
    'storage',
    'tabs',
    'unlimitedStorage',
  ],
  web_accessible_resources: [
    {
      resources,
      matches: ['<all_urls>'],
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval';",
  },
});
