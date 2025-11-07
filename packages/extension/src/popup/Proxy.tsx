// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import { useBootstrapping, useCogMenu } from './contexts';
import { buildCache, ContextProxyProvider } from '@polkadot-live/contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

export const ContextProxyMain = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        BootstrappingCtx: () => useBootstrapping(),
        CogMenuCtx: () => useCogMenu(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
