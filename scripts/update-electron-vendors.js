// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * This script should be run in electron context.
 * @example
 *   ELECTRON_RUN_AS_NODE=1 electron scripts/update-electron-vendors.js
 */

// NOTE: set `type: module` in package.json to enable ES syntax.
import { writeFileSync } from 'fs';
import path from 'path';

const electronRelease = process.versions;

const node = electronRelease.node.split('.')[0];
const chrome = electronRelease.v8.split('.').splice(0, 2).join('');

const browserslistrcPath = path.resolve(process.cwd(), '.browserslistrc');

writeFileSync(
  './.electron-vendors.cache.json',
  JSON.stringify({ chrome, node })
);
writeFileSync(browserslistrcPath, `Chrome ${chrome}`, 'utf8');
