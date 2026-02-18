// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { builtinModules } from 'node:module';
import pkg from './package.json';

export const builtins = [
  'electron',
  ...builtinModules.flatMap((m) => [m, `node:${m}`]),
];

export const external = [
  ...builtins,
  ...Object.keys(
    'dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {},
  ),
];
