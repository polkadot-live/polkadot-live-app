// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { builtinModules } from 'node:module';
import pkg from './package.json';

export const builtins = [
  'electron',
  ...builtinModules.map((m) => [m, `node:${m}`]).flat(),
];

export const external = [
  ...builtins,
  ...Object.keys(
    'dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {}
  ),
];
