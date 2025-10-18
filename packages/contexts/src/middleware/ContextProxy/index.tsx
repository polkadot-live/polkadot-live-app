// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useRef } from 'react';
import { createSafeContextHook } from '../../utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ContextProxyInterface, ContextValue, ContextsMap } from './types';

export const ContextProxy = createContext<ContextProxyInterface | undefined>(
  undefined
);

export const useContextProxy = createSafeContextHook(
  ContextProxy,
  'ContextProxy'
);

export interface ContextProxyProviderProps {
  children: React.ReactNode;
  initialCache?: Map<string, AnyData>;
}

export const ContextProxyProvider = ({
  children,
  initialCache,
}: ContextProxyProviderProps) => {
  /**
   * Cache of context values.
   */
  const cache = useRef<Map<string, AnyData>>(initialCache || new Map());

  /**
   * Get a context value.
   */
  const useCtx = <T extends keyof ContextsMap>(key: T): ContextValue<T> => {
    const ctx = cache.current.get(key);
    if (!ctx) {
      throw new Error(`${key} undefined`);
    }
    return ctx as ContextValue<T>;
  };

  return <ContextProxy value={{ useCtx }}>{children}</ContextProxy>;
};
