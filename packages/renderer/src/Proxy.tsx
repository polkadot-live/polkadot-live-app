// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { buildCache, ContextProxyProvider } from '@polkadot-live/contexts';
import { useMemo } from 'react';
import * as extrinsics from './contexts/action';
import * as imports from './contexts/import';
import * as main from './contexts/main';

interface ContextProxyProps {
  children: React.ReactNode;
}

/**
 * Extrinsics view.
 */
export const ContextProxyTab = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        TxMetaCtx: () => extrinsics.useTxMeta(),
        WalletConnectImportCtx: () => imports.useWalletConnectImport(),
        WcVerifierCtx: () => extrinsics.useWcVerifier(),
      }),
    [],
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};

/**
 * Main view.
 */
export const ContextProxyMain = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        BootstrappingCtx: () => main.useBootstrapping(),
        CogMenuCtx: () => main.useCogMenu(),
        WalletConnectCtx: () => main.useWalletConnect(),
      }),
    [],
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
