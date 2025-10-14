// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { use } from 'react';
import { ContextError } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types/misc';

export const createSafeContextHook =
  <T>(Context: React.Context<T | undefined>, name: string) =>
  () => {
    const context = use(Context);
    if (context === undefined) {
      throw new ContextError('ContextUndefined', name);
    }
    return context;
  };

export const buildCache = (
  entries: Record<string, () => AnyData>
): Map<string, () => AnyData> => {
  const cache = new Map<string, () => AnyData>();
  Object.entries(entries).forEach(([key, value]) => {
    cache.set(key, value);
  });
  return cache;
};
