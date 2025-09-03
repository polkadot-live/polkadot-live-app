// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { use } from 'react';
import { ContextError } from '@polkadot-live/core';

export const createSafeContextHook =
  <T>(Context: React.Context<T | undefined>, name: string) =>
  () => {
    const context = use(Context);
    if (context === undefined) {
      throw new ContextError('ContextUndefined', name);
    }
    return context;
  };
