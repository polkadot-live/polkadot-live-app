// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { buildCache, ContextProxyProvider } from '@polkadot-live/contexts';
import { useMemo } from 'react';
import {
  useTxMeta,
  useWalletConnect,
  useWalletConnectImport,
  useWcVerifier,
} from './contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

export const ContextProxyTab = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        WalletConnectCtx: () => useWalletConnect(),
        WalletConnectImportCtx: () => useWalletConnectImport(),
        WcVerifierCtx: () => useWcVerifier(),
        TxMetaCtx: () => useTxMeta(),
      }),
    [],
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
